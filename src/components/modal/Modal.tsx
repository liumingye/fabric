import { Modal, type ModalConfig } from '@arco-design/web-vue'
import type { AppContext } from 'vue'

interface MyModalConfig extends ModalConfig {
  // lastLock?: boolean
}

const _Modal = {
  ...Modal,
  open: (config: MyModalConfig, event?: MouseEvent, appContext?: AppContext) => {
    const modal = Modal.open(getConfig(config, event), appContext)
    // if (event) {
    //   nextTick(() => {
    //     setTransformOrigin(event)
    //   })
    // }
    return modal
  },
  confirm: (config: MyModalConfig, event?: MouseEvent, appContext?: AppContext) => {
    const modal = Modal.confirm(getConfig(config, event), appContext)
    // if (event) {
    //   nextTick(() => {
    //     setTransformOrigin(event)
    //   })
    // }
    return modal
  },
}

const getConfig = (config: MyModalConfig, event?: MouseEvent): MyModalConfig => {
  // if (event) {
  //   config.onBeforeClose = () => {
  //     event && setTransformOrigin(event)
  //   }
  // }
  return {
    alignCenter: false,
    // top: breakpoints.value.md ? '15vh' : 20,
    ...config,
    modalStyle: {
      // width: 'calc(100% - 32px)',
      // borderWidth: '1px',
      // borderRadius: '0.75rem',
      ...config.modalStyle,
    },
    // onOpen: () => {
    //   config.onOpen && config.onOpen()
    // },
    // onBeforeClose: () => {
    //   config.onBeforeClose && config.onBeforeClose()
    // },
  }
}

export default _Modal
