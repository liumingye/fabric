import { EditorService } from './types'

export class Container<T extends Record<string, any> = EditorService> {
  private dependencies = new Map()
  private instances = new Map<keyof T, T[keyof T]>()

  register<K extends keyof T>(
    name: K,
    implementation: new (...args: any[]) => T[K],
    dependencies: Array<keyof T> = [],
  ) {
    this.dependencies.set(name, { dependencies, implementation })
  }

  resolve<K extends keyof T>(name: K): T[K] {
    if (!this.instances.has(name)) {
      const { dependencies, implementation } = this.dependencies.get(name)
      const args = dependencies.map((dep: keyof T) => this.resolve(dep))
      const instance = new implementation(...args)
      this.instances.set(name, instance)
    }

    return this.instances.get(name) as T extends Record<K, infer U> ? U : never
  }
}
