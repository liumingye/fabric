import {useEditor} from '@/app'
import {useFileDialog, useFileSystemAccess} from '@vueuse/core'

export function useImport() {
    const {canvas} = useEditor()

    const {isSupported, create, open, data, save} = useFileSystemAccess({
        types: [
            {
                accept: {
                    'application/json': ['.json'],
                },
            },
        ],
        dataType: 'Text',
    })

    const {open: openDialog, onChange} = useFileDialog({
        accept: 'application/json',
    })

    onChange((files) => {
        if (!files) return
        files
            .item(0)
            ?.text()
            .then((result) => {
                canvas.importPages(result)
            })
    })

    const importPages = async () => {
        if (isSupported) {
            data.value = undefined
            await open()
            if (!isDefined(data)) return
            canvas.importPages(data.value)
        } else {
            // 传统打开
            openDialog()
        }
    }

    const exportPages = async () => {
        if (isSupported) {
            await create({
                suggestedName: '未命名.json',
            })
            data.value = JSON.stringify(canvas.exportPages())
            await save()
            data.value = undefined
        } else {
            // 传统链接下载
            const blob = new Blob([JSON.stringify(canvas.exportPages())]) //  创建 blob 对象
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob) //  创建一个 URL 对象并传给 a 的 href
            link.download = '未命名.json' //  设置下载的默认文件名
            link.click()
        }
    }

    const exportImage = async () => {
        // todo 导出为图片
        const url=await canvas.exportImageUrl()
        // 创建一个链接元素，并设置其下载属性和链接地址
        const link = document.createElement('a');
        link.download = 'canvas.png'; // 下载的文件名
        link.href = url ;
        // 模拟点击下载链接
        link.click();
    }

    return {
        importPages,
        exportPages,
        exportImage
    }
}
