import { use } from 'echarts/core'
import { BarChart, RadarChart } from 'echarts/charts'
import { GraphicComponent, GridComponent, LegendComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, RadarChart, GraphicComponent, GridComponent, LegendComponent, RadarComponent, CanvasRenderer])
export { init } from 'echarts/core'
