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
  const dragGhostRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!editor || !isDragging) return

    const editorElement = editor.view.dom

    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement
      const nodeElement = target.closest('[data-node-view-wrapper], .ProseMirror > *')

      if (!nodeElement || !(nodeElement instanceof HTMLElement)) return

      // Crear elemento de arrastre personalizado
      const dragGhost = nodeElement.cloneNode(true) as HTMLElement
      dragGhost.style.position = 'absolute'
      dragGhost.style.top = '-9999px'
      dragGhost.style.left = '-9999px'
      dragGhost.style.opacity = '0.8'
      dragGhost.style.pointerEvents = 'none'
      dragGhost.style.zIndex = '9999'

      document.body.appendChild(dragGhost)
      dragGhostRef.current = dragGhost

      // Establecer el drag image en la posición del cursor
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        const rect = nodeElement.getBoundingClientRect()
        const offsetX = event.clientX - rect.left
        const offsetY = event.clientY - rect.top
        event.dataTransfer.setDragImage(dragGhost, offsetX, offsetY)
      }
    }

    const handleDrag = (event: DragEvent) => {
      // Actualizar posición del ghost element para seguir el cursor
      if (dragGhostRef.current && event.clientX !== 0 && event.clientY !== 0) {
        dragGhostRef.current.style.top = `${event.clientY + 10}px`
        dragGhostRef.current.style.left = `${event.clientX + 10}px`
      }
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const target = event.target as HTMLElement

      // Buscar el nodo padre más cercano que sea un bloque de contenido
      const nodeElement = target.closest('[data-node-view-wrapper], .ProseMirror > *')

      if (!nodeElement || !(nodeElement instanceof HTMLElement)) return

      // Obtener la posición del nodo en el documento de TipTap
      const pos = editor.view.posAtDOM(nodeElement, 0)
      const $pos = editor.state.doc.resolve(pos)
      const node = $pos.node()

      // Obtener identificador del nodo
      const nodeId = node.attrs?.id || `node-${pos}` // Usar ID del nodo o posición como fallback

      console.log('🎯 dragover', {
        target: nodeElement,
        nodeName: nodeElement.nodeName,
        classList: Array.from(nodeElement.classList),
        nodeId: nodeId,
        nodePos: pos,
        nodeType: node.type.name,
        nodeAttrs: node.attrs,
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

      // Definir zonas específicas en píxeles desde cada borde
      const horizontalMargin = 150 // Zona lateral de 150px desde izquierda/derecha
      const verticalMargin = 30    // Zona superior/inferior de 30px desde arriba/abajo

      // Calcular posición relativa dentro del elemento
      const relativeX = event.clientX - rect.left
      const relativeY = event.clientY - rect.top

      // Determinar en qué zona está el cursor
      const isInLeftZone = relativeX <= horizontalMargin
      const isInRightZone = relativeX >= rect.width - horizontalMargin
      const isInTopZone = relativeY <= verticalMargin
      const isInBottomZone = relativeY >= rect.height - verticalMargin

      console.log('🎯 Zonas detectadas', {
        relativeX,
        relativeY,
        width: rect.width,
        height: rect.height,
        horizontalMargin,
        isInLeftZone,
        isInRightZone,
        isInTopZone,
        isInBottomZone,
      })

      // Prioridad: laterales primero, luego verticales
      if (isInLeftZone) {
        nodeElement.classList.add('drop-indicator-left')
        console.log('📍 Indicador a la izquierda del elemento')
      } else if (isInRightZone) {
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

      // Limpiar el elemento ghost
      if (dragGhostRef.current) {
        document.body.removeChild(dragGhostRef.current)
        dragGhostRef.current = null
      }
    }

    // Agregar event listeners
    editorElement.addEventListener('dragstart', handleDragStart as EventListener)
    editorElement.addEventListener('drag', handleDrag as EventListener)
    editorElement.addEventListener('dragover', handleDragOver as EventListener)
    editorElement.addEventListener('dragleave', handleDragLeave as EventListener)
    editorElement.addEventListener('drop', handleDrop as EventListener)
    editorElement.addEventListener('dragend', handleDragEnd as EventListener)

    return () => {
      // Cleanup
      editorElement.removeEventListener('dragstart', handleDragStart as EventListener)
      editorElement.removeEventListener('drag', handleDrag as EventListener)
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
