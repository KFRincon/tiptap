import * as React from "react"
import type { Editor } from "@tiptap/react"

interface DragDropIndicatorOptions {
  editor: Editor | null
  isDragging: boolean
}

export const useDragDropIndicator = ({
  editor,
  isDragging,
}: DragDropIndicatorOptions) => {
  React.useEffect(() => {
    if (!editor || !isDragging) return

    const editorElement = editor.view.dom

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const target = event.target as HTMLElement

      // Buscar el nodo padre más cercano que sea un bloque de contenido
      const nodeElement = target.closest('[data-node-view-wrapper], .ProseMirror > *')

      if (!nodeElement || !(nodeElement instanceof HTMLElement)) return

      console.log('🎯 dragover', {
        target: nodeElement,
        nodeName: nodeElement.nodeName,
        classList: Array.from(nodeElement.classList),
        clientY: event.clientY,
        elementTop: nodeElement.getBoundingClientRect().top,
        elementBottom: nodeElement.getBoundingClientRect().bottom,
      })

      // Calcular la posición del cursor en relación al elemento
      const rect = nodeElement.getBoundingClientRect()

      // Remover indicadores previos
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.remove(
          'drop-indicator',
          'drop-indicator-top',
          'drop-indicator-bottom',
          'drop-indicator-left',
          'drop-indicator-right'
        )
      })

      // Agregar nuevo indicador basado en la posición
      nodeElement.classList.add('drop-indicator')

      // Determinar qué lado está más cerca
      const distanceTop = Math.abs(event.clientY - rect.top)
      const distanceBottom = Math.abs(event.clientY - rect.bottom)
      const distanceLeft = Math.abs(event.clientX - rect.left)
      const distanceRight = Math.abs(event.clientX - rect.right)

      const minDistance = Math.min(distanceTop, distanceBottom, distanceLeft, distanceRight)

      if (minDistance === distanceTop) {
        nodeElement.classList.add('drop-indicator-top')
        console.log('📍 Indicador arriba del elemento')
      } else if (minDistance === distanceBottom) {
        nodeElement.classList.add('drop-indicator-bottom')
        console.log('📍 Indicador abajo del elemento')
      } else if (minDistance === distanceLeft) {
        nodeElement.classList.add('drop-indicator-left')
        console.log('📍 Indicador a la izquierda del elemento')
      } else {
        nodeElement.classList.add('drop-indicator-right')
        console.log('📍 Indicador a la derecha del elemento')
      }
    }

    const handleDragLeave = (event: DragEvent) => {
      const target = event.target as HTMLElement
      const nodeElement = target.closest('[data-node-view-wrapper], .ProseMirror > *')

      if (!nodeElement) return

      console.log('👋 dragleave', {
        target: nodeElement,
        nodeName: nodeElement.nodeName,
      })

      // Remover indicador solo si realmente salimos del elemento
      const relatedTarget = event.relatedTarget as HTMLElement
      if (!nodeElement.contains(relatedTarget)) {
        nodeElement.classList.remove(
          'drop-indicator',
          'drop-indicator-top',
          'drop-indicator-bottom',
          'drop-indicator-left',
          'drop-indicator-right'
        )
      }
    }

    const handleDrop = (event: DragEvent) => {
      console.log('💥 drop event', {
        clientX: event.clientX,
        clientY: event.clientY,
      })

      // Limpiar todos los indicadores
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.remove(
          'drop-indicator',
          'drop-indicator-top',
          'drop-indicator-bottom',
          'drop-indicator-left',
          'drop-indicator-right'
        )
      })
    }

    const handleDragEnd = () => {
      console.log('🏁 dragend - limpiando indicadores')

      // Limpiar todos los indicadores
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.remove(
          'drop-indicator',
          'drop-indicator-top',
          'drop-indicator-bottom',
          'drop-indicator-left',
          'drop-indicator-right'
        )
      })
    }

    // Agregar event listeners
    editorElement.addEventListener('dragover', handleDragOver as EventListener)
    editorElement.addEventListener('dragleave', handleDragLeave as EventListener)
    editorElement.addEventListener('drop', handleDrop as EventListener)
    editorElement.addEventListener('dragend', handleDragEnd as EventListener)

    return () => {
      // Cleanup
      editorElement.removeEventListener('dragover', handleDragOver as EventListener)
      editorElement.removeEventListener('dragleave', handleDragLeave as EventListener)
      editorElement.removeEventListener('drop', handleDrop as EventListener)
      editorElement.removeEventListener('dragend', handleDragEnd as EventListener)

      // Limpiar indicadores al desmontar
      document.querySelectorAll('.drop-indicator').forEach((el) => {
        el.classList.remove(
          'drop-indicator',
          'drop-indicator-top',
          'drop-indicator-bottom',
          'drop-indicator-left',
          'drop-indicator-right'
        )
      })
    }
  }, [editor, isDragging])
}
