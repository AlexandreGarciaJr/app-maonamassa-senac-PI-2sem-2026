/**
 * Categorias de serviço. O `slug` é o identificador trocado com o backend.
 * `emoji` segue a identidade do protótipo original.
 * `featured` define as 6 categorias exibidas de início na home (como no protótipo).
 * `types` alimenta o select "Tipo de serviço" no cadastro de serviço.
 */
export const CATEGORIES = [
  {
    slug: 'eletrica',
    label: 'Eletricista',
    area: 'Elétrica',
    emoji: '⚡',
    featured: true,
    types: [
      'Instalação de tomadas',
      'Troca de disjuntor',
      'Instalação de lustres e luminárias',
      'Passagem de fiação',
      'Instalação de chuveiro elétrico',
      'Revisão da rede elétrica',
    ],
  },
  {
    slug: 'hidraulica',
    label: 'Encanador(a)',
    area: 'Hidráulica',
    emoji: '🔧',
    featured: true,
    types: [
      'Conserto de vazamento',
      'Instalação de torneira',
      'Desentupimento',
      'Instalação de caixa d’água',
      'Reparo em encanamento',
    ],
  },
  {
    slug: 'pintura',
    label: 'Pintor(a)',
    area: 'Pintura',
    emoji: '🖌️',
    featured: true,
    types: [
      'Pintura de parede interna',
      'Pintura externa',
      'Textura e grafiato',
      'Pintura de portas e grades',
    ],
  },
  {
    slug: 'manutencao',
    label: 'Manutenção',
    area: 'Manutenção',
    emoji: '🔨',
    featured: true,
    types: [
      'Reparos gerais',
      'Instalação de prateleiras',
      'Troca de fechaduras',
      'Vedação e rejunte',
    ],
  },
  {
    slug: 'montagem',
    label: 'Montador(a)',
    area: 'Montagem',
    emoji: '🪛',
    featured: true,
    types: [
      'Montagem de móveis',
      'Instalação de suporte de TV',
      'Instalação de cortinas e persianas',
    ],
  },
  {
    slug: 'limpeza',
    label: 'Diarista',
    area: 'Limpeza',
    emoji: '🧹',
    featured: true,
    types: ['Limpeza residencial', 'Limpeza pós-obra', 'Passar roupa', 'Limpeza comercial'],
  },
  {
    slug: 'alvenaria',
    label: 'Pedreiro(a)',
    area: 'Alvenaria',
    emoji: '🧱',
    types: [
      'Pequenas reformas',
      'Assentamento de piso',
      'Reboco e acabamento',
      'Construção de muro',
    ],
  },
  {
    slug: 'jardinagem',
    label: 'Jardineiro(a)',
    area: 'Jardinagem',
    emoji: '🌿',
    types: ['Corte de grama', 'Poda de árvores e arbustos', 'Paisagismo', 'Manutenção de jardim'],
  },
]

export const getCategory = (slug) => CATEGORIES.find((category) => category.slug === slug)

export const categoryEmoji = (slug) => getCategory(slug)?.emoji ?? '⚒️'

export const PRICE_UNITS = {
  servico: 'por serviço',
  hora: 'por hora',
  visita: 'por visita',
}

export const GENDERS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informado', label: 'Prefiro não informar' },
]
