export interface CathodeComponent {
  materialId: string
  massPercent: number
}

export interface Cathode {
  id: string
  name: string
  components: CathodeComponent[]
}
