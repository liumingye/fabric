import { FabricObject, util, Group, Canvas } from '@fabric'
import { toRefObject } from '@/core/canvas/toRefObject'
import { randomText } from '@/utils/strings'
import { noop } from '@vueuse/core'
import { IUndoRedoService2, UndoRedoService2, Command } from '@/core/undoRedo/undoRedoService2'
import { getActiveCore } from '@/core'

export type Constructor<T = any> = new (...args: any[]) => T

class MyCommand implements Command {
  execute() {}
  undo() {}
  // redo() {}
  label() {
    return 'Collection'
  }
}

export function createCollectionMixin<TBase extends Constructor>(Base: TBase): TBase {
  class Collection extends (Base as Constructor<Group & Canvas>) {
    override add(...objects: FabricObject[]): number {
      return super.add(
        ...objects.map((obj) => {
          this.setDefaultAttr(obj)
          return toRefObject(obj)
        }),
      )
      return getActiveCore().service.invokeFunction((accessor) => {
        const undoRedo = accessor.get(IUndoRedoService2)
        const myCommand = new MyCommand()
        myCommand.execute = () => {
          return super.add(
            ...objects.map((obj) => {
              this.setDefaultAttr(obj)
              return toRefObject(obj)
            }),
          )
        }
        myCommand.undo = () => {
          super.remove(...objects)
        }
        return undoRedo.execute(myCommand) as unknown as number
      })
    }

    override insertAt(index: number, ...objects: FabricObject[]): number {
      return super.insertAt(
        index,
        ...objects.map((obj) => {
          this.setDefaultAttr(obj)
          return toRefObject(obj)
        }),
      )
      return getActiveCore().service.invokeFunction((accessor) => {
        const undoRedo = accessor.get(IUndoRedoService2)
        const myCommand = new MyCommand()
        myCommand.execute = () => {
          return super.insertAt(
            index,
            ...objects.map((obj) => {
              this.setDefaultAttr(obj)
              return toRefObject(obj)
            }),
          )
        }
        myCommand.undo = () => {
          super.remove(...objects)
        }
        return undoRedo.execute(myCommand) as unknown as number
      })
    }

    // override remove(...objects: FabricObject[]): FabricObject[] {
    //   return getActiveCore().service.invokeFunction((accessor) => {
    //     const undoRedo = accessor.get(IUndoRedoService2)
    //     const myCommand = new MyCommand()
    //     const objectPos: [FabricObject, number][] = []
    //     console.log(objects)
    //     myCommand.execute = () => {
    //       const array = this._objects,
    //         removed: FabricObject[] = []
    //       objects.forEach((object) => {
    //         const index = array.indexOf(object)
    //         // only call onObjectRemoved if an object was actually removed
    //         if (index !== -1) {
    //           objectPos.push([object, index])
    //           array.splice(index, 1)
    //           removed.push(object)
    //           this._onObjectRemoved(object)
    //         }
    //       })
    //       console.log(objectPos)
    //       return removed
    //     }
    //     myCommand.undo = () => {
    //       objectPos.forEach(([object, index]) => {
    //         super.insertAt(index, object)
    //       })
    //     }
    //     return undoRedo.execute(myCommand) as unknown as FabricObject[]
    //   })
    // }

    override _onObjectAdded(object: FabricObject) {
      if (object.noEventObjectAdded && this.fire !== noop) {
        const fire = this.fire
        this.fire = noop
        try {
          super._onObjectAdded(object)
        } finally {
          this.fire = fire
        }
      } else {
        super._onObjectAdded(object)
      }
      this.updateObjects()
    }

    override _onObjectRemoved(object: FabricObject) {
      super._onObjectRemoved(object)
      this.updateObjects()
    }

    override _onStackOrderChanged() {
      super._onStackOrderChanged()
      this.updateObjects()
    }

    private updateObjects() {
      const ref = this.ref?.objects || this.canvas?.ref.objects
      ref && triggerRef(ref)
    }

    private uniqueIds = new Map<string, number>()

    private setDefaultAttr(target: FabricObject) {
      // 添加名称
      // todo 临时方法 findFirstMissingPositive
      if (!target.name) {
        const className = target.type
        const id = this.uniqueIds.get(className) || 1
        target.set({
          name: `${className} ${id}`,
        })
        this.uniqueIds.set(className, id + 1)
      }
      // 添加id
      if (!target.id) {
        target.set({
          id: randomText(),
        })
      }
      if (util.isCollection(target)) {
        target._objects.forEach((obj) => {
          this.setDefaultAttr(obj)
        })
      }
    }
  }
  return Collection as typeof Collection & TBase
}
