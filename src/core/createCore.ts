import { getSingletonServiceDescriptors } from '@/core/instantiation/extensions'
import { IInstantiationService } from '@/core/instantiation/instantiation'
import { InstantiationService } from '@/core/instantiation/instantiationService'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { setActiveCore } from '@/core/root'
import { ICore } from '@/core/types'
import { appInstance } from '@/app'

const createServices = (): IInstantiationService => {
  const services = new ServiceCollection()

  // 获取单例服务
  for (const [id, descriptor] of getSingletonServiceDescriptors()) {
    services.set(id, descriptor)
  }

  return new InstantiationService(services, true)
}

export const createCore = (): ICore => {
  const service = createServices()
  const core: ICore = markRaw({
    install(vueApp) {
      this._a = vueApp
      setActiveCore(core)
    },
    use(plugin) {
      // todo 插件管理和生命周期
      this._p.push(plugin)
      appInstance.editor?.use(plugin)
      return this
    },
    service,
    _p: [],
    // @ts-expect-error
    _a: null,
  })

  return core
}
