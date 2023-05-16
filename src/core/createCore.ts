import { EditorMain } from '@/app/editor'
import { getSingletonServiceDescriptors } from '@/core/instantiation/extensions'
import { IInstantiationService } from '@/core/instantiation/instantiation'
import { InstantiationService } from '@/core/instantiation/instantiationService'
import { ServiceCollection } from '@/core/instantiation/serviceCollection'
import { setActiveCore } from '@/core/root'
import { ICore } from '@/core/types'

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
      // 创建编辑器实例
      core.service.createInstance(EditorMain)
      this.app.editor = service.createInstance(EditorMain)
      this.app.editor.startup()
    },
    use(plugin) {
      // todo 插件管理和生命周期
      this._p.push(plugin)
      this.app.editor?.use(plugin)
      return this
    },
    service,
    app: {
      // @ts-expect-error
      editor: null,
    },
    _p: [],
    // @ts-expect-error
    _a: null,
  })

  return core
}
