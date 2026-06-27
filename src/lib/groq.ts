import Groq from 'groq-sdk'
import { config } from '../config/config.service.js'
import type { Logger } from 'winston'
import logger from './winston.js'

const SYSTEM_PROMPT = `Tu génères des dilemmes "Tu préférerais..." (would you rather) pour un jeu Discord entre adultes (25-35 ans), dans un cercle privé.

Ton et style :
- Dilemmes très tranchés, dérangeants, glauques ou absurdes — les deux options doivent être difficiles à choisir.
- Humour noir, scénarios catastrophe, éthique tordue, situations gênantes ou crades assumées.
- Ca doit faire écho à la part la plus sombre des personnes.
- Pas de choix tièdes ou consensuels : si on peut répondre sans hésiter, c'est raté.

Règles de format :
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans backticks.
- Structure : {"optionA": "...", "optionB": "..."}
- Chaque option : une phrase courte et percutante, sans le préfixe "Tu préférerais".
- Les deux options doivent être thématiquement liées mais opposées.
- Les deux options ne doivent pas dépasser 55 caractères.

Exemples : 
- Tu préfères avoir le sang qui bout ou le bout qui sent ?
- Tu préfères sucer Hitler ou Ben Laden ?
- Tu préfères être avec la femme la plus belle du monde ou ressuciter les morts ?
- Tu préfères que ta mère voit le film de ta vie ou tu préfères voir leur film à eux ?`

interface WyrQuestion {
  optionA: string
  optionB: string
}

class LlmService {
  private readonly groq = new Groq({ apiKey: config.get('GROQ_API_KEY') })
  private readonly model = 'llama-3.3-70b-versatile'

  constructor(private readonly logger: Logger) {}

  /**
   * Generate a new question.
   *
   * @param recent - Recent questions asked (to avoid repetition)
   *
   * @returns WyrQuestion
   */
  async generate(recent: string[] = []): Promise<WyrQuestion> {
    const avoidance = recent.length
      ? `\n\nÉvite ces thèmes déjà sortis : ${recent.join(' / ')}`
      : ''

    const completion = await this.groq.chat.completions.create({
      model: this.model,
      temperature: 1.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + avoidance },
        { role: 'user', content: 'Génère un nouveau dilemme.' },
      ],
    })

    return this.parse(completion.choices[0]?.message?.content)
  }

  private parse(raw: string | null | undefined): WyrQuestion {
    if (!raw) throw new Error('Réponse vide de Groq')

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      this.logger.error(`JSON invalide de Groq: ${raw}`)
      throw new Error('Réponse Groq non parsable')
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as WyrQuestion).optionA !== 'string' ||
      typeof (parsed as WyrQuestion).optionB !== 'string'
    ) {
      throw new Error('Structure de réponse Groq inattendue')
    }

    return parsed as WyrQuestion
  }
}

export const llm = new LlmService(logger)
