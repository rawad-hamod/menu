export interface DashboardRestaurant {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  sections: Array<{
    id: string
    name: string
    displayOrder: number
    items: Array<{
      id: string
      name: string
      description: string | null
      price: number
      imageUrl: string | null
      isAvailable: boolean
      displayOrder: number
    }>
  }>
}

export type DashboardItem = DashboardRestaurant['sections'][number]['items'][number]
