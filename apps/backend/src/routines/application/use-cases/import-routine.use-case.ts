import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import OpenAI from 'openai';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../../exercises/domain/repositories/exercise.repository.port';

export interface ImportedExerciseDraft {
  /** Si el LLM ha podido mapear al catálogo. NULL = el usuario lo elige. */
  exerciseId: string | null;
  /** Nombre tal como aparece en el origen (Excel / imagen). */
  rawName: string;
  /** Nombre canónico del ejercicio matcheado (si lo hay). */
  matchedName?: string | null;
  orderInRoutine: number;
  sets?: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;
  notes?: string;
}

export interface ImportedRoutineDraft {
  name: string;
  description?: string;
  exercises: ImportedExerciseDraft[];
}

interface LlmExercise {
  rawName: string;
  matchedExerciseId: string | null;
  matchedName: string | null;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  restSeconds: number | null;
  notes: string | null;
}

interface LlmResponse {
  name: string;
  description: string | null;
  exercises: LlmExercise[];
}

/**
 * Toma un Excel / CSV o una imagen y devuelve un borrador de rutina:
 * lista de ejercicios con sus parámetros, intentando mapear cada uno
 * al catálogo de la app vía LLM. El frontend muestra ese borrador en
 * el editor y el usuario confirma / corrige antes de guardar.
 */
@Injectable()
export class ImportRoutineUseCase {
  private readonly logger = new Logger(ImportRoutineUseCase.name);
  private readonly openai: OpenAI | null;

  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercises: ExerciseRepositoryPort,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async execute(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }): Promise<ImportedRoutineDraft> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY no configurado en el backend',
      );
    }

    const isImage = file.mimetype.startsWith('image/');
    const isSpreadsheet =
      file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('csv') ||
      file.mimetype === 'application/vnd.ms-excel' ||
      /\.(xlsx|xls|csv)$/i.test(file.originalname);

    if (!isImage && !isSpreadsheet) {
      throw new BadRequestException(
        'Formato no soportado. Sube un Excel/CSV o una imagen.',
      );
    }

    const catalog = await this.buildCatalogPrompt();

    if (isImage) {
      return this.parseImage(file, catalog);
    }
    const rows = this.parseSpreadsheetToRows(file.buffer);
    return this.normalizeWithLlm({ rows }, catalog);
  }

  private parseSpreadsheetToRows(buffer: Buffer): string[][] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) {
      throw new BadRequestException('El archivo no tiene hojas');
    }
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: '',
    });
    if (rows.length === 0) {
      throw new BadRequestException('La hoja está vacía');
    }
    return rows.map((r) => r.map((c) => String(c ?? '').trim()));
  }

  private async buildCatalogPrompt(): Promise<{
    text: string;
    byNormalizedName: Map<string, string>;
  }> {
    const all = await this.exercises.findAll();
    const byNormalizedName = new Map<string, string>();
    const lines: string[] = [];
    for (const e of all) {
      byNormalizedName.set(this.normalize(e.name), e.id);
      lines.push(`- ${e.id}: ${e.name}`);
    }
    return {
      text: lines.join('\n'),
      byNormalizedName,
    };
  }

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async parseImage(
    file: { buffer: Buffer; mimetype: string },
    catalog: { text: string; byNormalizedName: Map<string, string> },
  ): Promise<ImportedRoutineDraft> {
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: this.systemPrompt(catalog.text),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Extrae los ejercicios de esta imagen y devuelve el JSON.',
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    return this.parseLlmJson(completion.choices[0]?.message?.content, catalog);
  }

  private async normalizeWithLlm(
    payload: { rows: string[][] },
    catalog: { text: string; byNormalizedName: Map<string, string> },
  ): Promise<ImportedRoutineDraft> {
    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: this.systemPrompt(catalog.text) },
        {
          role: 'user',
          content:
            'Hoja de cálculo en filas/columnas como JSON 2D:\n' +
            JSON.stringify(payload.rows),
        },
      ],
    });

    return this.parseLlmJson(completion.choices[0]?.message?.content, catalog);
  }

  private systemPrompt(catalogText: string): string {
    return `Eres un asistente que extrae una rutina de entrenamiento desde un archivo o imagen y la mapea al catálogo de ejercicios de la app.

Devuelve EXCLUSIVAMENTE un JSON con esta forma exacta:

{
  "name": "string — nombre de la rutina (deducido o 'Rutina importada')",
  "description": "string|null — opcional",
  "exercises": [
    {
      "rawName": "nombre tal cual aparece en el origen",
      "matchedExerciseId": "uuid del catálogo o null si no encuentras nada razonable",
      "matchedName": "nombre canónico del catálogo o null",
      "sets": number|null,
      "reps": number|null,
      "weight": number|null,         // kg
      "durationSeconds": number|null,
      "distanceMeters": number|null,
      "restSeconds": number|null,
      "notes": "string|null — observaciones del usuario si las hay"
    }
  ]
}

Reglas:
- Mapea cada rawName al ejercicio más probable del catálogo de abajo. Si la similitud es baja, deja matchedExerciseId y matchedName en null.
- NUNCA inventes IDs: usa solo los del catálogo.
- Si el origen indica algo como "4x10 80kg", entonces sets=4, reps=10, weight=80.
- Si solo hay tiempo (p.ej. plancha 60s), usa durationSeconds.
- Mantén el orden de aparición.
- Si no detectas ningún ejercicio, devuelve exercises: [].

Catálogo de ejercicios (id: nombre):
${catalogText}`;
  }

  private parseLlmJson(
    raw: string | null | undefined,
    catalog: { byNormalizedName: Map<string, string> },
  ): ImportedRoutineDraft {
    if (!raw) {
      throw new BadRequestException('El modelo no devolvió contenido');
    }
    let parsed: LlmResponse;
    try {
      parsed = JSON.parse(raw) as LlmResponse;
    } catch {
      throw new BadRequestException(
        'No se pudo interpretar la respuesta del modelo',
      );
    }

    const exercises: ImportedExerciseDraft[] = (parsed.exercises ?? []).map(
      (e, idx) => {
        // Defensa: si el LLM se ha inventado un id que no existe en el
        // catálogo, lo descartamos y caemos a un match local por nombre.
        let exerciseId = e.matchedExerciseId ?? null;
        let matchedName = e.matchedName ?? null;
        if (exerciseId) {
          const knownIds = new Set(catalog.byNormalizedName.values());
          if (!knownIds.has(exerciseId)) {
            exerciseId = null;
            matchedName = null;
          }
        }
        if (!exerciseId && e.rawName) {
          const fromName = catalog.byNormalizedName.get(
            this.normalize(e.rawName),
          );
          if (fromName) {
            exerciseId = fromName;
            matchedName = e.rawName;
          }
        }
        return {
          exerciseId,
          rawName: e.rawName ?? '(sin nombre)',
          matchedName,
          orderInRoutine: idx + 1,
          sets: e.sets ?? undefined,
          reps: e.reps ?? undefined,
          weight: e.weight ?? undefined,
          durationSeconds: e.durationSeconds ?? undefined,
          distanceMeters: e.distanceMeters ?? undefined,
          restSeconds: e.restSeconds ?? undefined,
          notes: e.notes ?? undefined,
        };
      },
    );

    return {
      name: parsed.name?.trim() || 'Rutina importada',
      description: parsed.description ?? undefined,
      exercises,
    };
  }
}
