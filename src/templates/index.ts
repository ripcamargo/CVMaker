import type { ComponentType } from 'react'
import type { TemplateId } from '../types/resume'
import { ElegantTemplate } from './ElegantTemplate'
import { ModernTemplate } from './ModernTemplate'
import { EuropassTemplate } from './EuropassTemplate'
import type { TemplateProps } from './shared'

export const TEMPLATE_COMPONENTS: Record<TemplateId, ComponentType<TemplateProps>> = {
  elegant: ElegantTemplate,
  modern: ModernTemplate,
  europass: EuropassTemplate,
}
