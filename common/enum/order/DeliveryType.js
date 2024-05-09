import Enum from '../enum'

/**
 * 枚举类：配送方式
 * DeliveryTypeEnum
 */
export default new Enum([
  { key: 'EXPRESS', name: '快递配送', value: 10 },
  { key: 'NOTHING', name: '无需配送', value: 30 }
])
