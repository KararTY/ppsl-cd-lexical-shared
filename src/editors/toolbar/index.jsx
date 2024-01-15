import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  // PlusSquareIcon,
  Redo2Icon,
  TimerResetIcon,
  Undo2Icon
} from 'lucide-react'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  DEPRECATED_$isGridSelection as deprecated$isGridSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $setBlocksType } from '@lexical/selection'

import { blockTypeToBlockName } from '../blocks'
import { RESET_EDITOR } from '../plugins/EntityContainer/commands'
import { RenderModal } from '#/components/modal'
import { ConfirmModal } from '#/components/modal/ConfirmModal'
import { resetEditorModalContent } from './modalData'

const LowPriority = 1

const blockTypes = ['paragraph', 'quote'].reduce((curr, blockType) => {
  curr[blockTypeToBlockName[blockType]] = blockType
  return curr
}, {})

const supportedBlockTypes = new Set(Object.values(blockTypes))

function Divider () {
  return (
    <div className="min-h-[1em] w-[0.1rem] self-stretch bg-neutral-100 bg-opacity-100 dark:bg-opacity-5" />
  )
}

function Button ({ children, className = '', ...restProps }) {
  return (
    <button
      type="button"
      className={`m-0 w-[unset] p-1 px-2 text-xs text-black dark:text-white ${className}`}
      {...restProps}
    >
      {children}
    </button>
  )
}

function ButtonIcon ({
  Icon,
  active,
  className = '',
  children,
  label,
  ...restProps
}) {
  return (
    <Button
      className={`flex items-center justify-center gap-2 !px-1 disabled:border-slate-500 disabled:bg-slate-500 disabled:bg-opacity-25 ${
        active ? 'bg-[var(--primary)] text-white' : ''
      } ${className}`}
      title={label}
      aria-label={label}
      {...restProps}
    >
      {Icon && <Icon size="0.75rem" />}
      {children && <span className="leading-none">{children}</span>}
    </Button>
  )
}

function Select ({ children, ...restProps }) {
  return (
    <select className="m-0 w-32 p-0 !text-xs" {...restProps}>
      {children}
    </select>
  )
}

export function Toolbar ({ title = '' }) {
  const [editor] = useLexicalComposerContext()

  const toolbarRef = useRef(null)

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const [blockType] = useState('paragraph')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  // const [isEntity, setIsEntity] = useState(false)

  const [confirmModal, setConfirmModal] = useState(null)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!selection?.hasFormat) return

    setIsBold(selection.hasFormat('bold'))
    setIsItalic(selection.hasFormat('italic'))
  }, [editor])

  const formatByBlockType = {
    paragraph: () => {
      editor.update(() => {
        const selection = $getSelection()
        if (
          $isRangeSelection(selection) ||
          deprecated$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
    }
  }

  const onChangeBlockType = (e) => {
    const { value } = e.target
    console.log(value)

    const formatFunction = formatByBlockType[value]

    if (formatFunction) formatFunction()
  }

  const isEditable = editor.isEditable()

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar()
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        RESET_EDITOR,
        () => {
          setConfirmModal(resetEditorModalContent(setConfirmModal))
        },
        LowPriority
      )
    )
  }, [editor, updateToolbar])

  return (
    <>
      <header
        ref={toolbarRef}
        className="sticky top-0 z-40 m-0 flex flex-col gap-2 p-3 shadow-sm"
      >
        {title !== false && (
          <div className="flex items-center gap-1">
            <strong className="grow">{title}</strong>
          </div>
        )}

        {isEditable && (
          <>
            {title !== false && <hr />}

            <div className="flex gap-1">
              <ButtonIcon
                className="active"
                Icon={Undo2Icon}
                disabled={!canUndo}
                onClick={() => {
                  editor.dispatchCommand(UNDO_COMMAND)
                }}
              />
              <ButtonIcon
                className="active"
                Icon={Redo2Icon}
                disabled={!canRedo}
                onClick={() => {
                  editor.dispatchCommand(REDO_COMMAND)
                }}
              />

              <Divider />

              {supportedBlockTypes.has(blockType) && (
                <Select disabled value={blockType} onChange={onChangeBlockType}>
                  {Object.entries(blockTypes).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
                </Select>
              )}

              <Divider />

              <ButtonIcon
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                }
                label="Format Bold"
                active={isBold}
                Icon={BoldIcon}
              />
              <ButtonIcon
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
                }
                label="Format Italic"
                active={isItalic}
                Icon={ItalicIcon}
              />

              <div className="flex gap-1 ml-auto">
                <Divider />
                <ButtonIcon
                  onClick={() => editor.dispatchCommand(RESET_EDITOR)}
                  label="Reset"
                  Icon={TimerResetIcon}
                />
              </div>

              {/* <Divider />

            <ButtonIcon
              onClick={() => editor.dispatchCommand()}
              active={isEntity}
              aria-label="Insert entity"
              Icon={PlusSquareIcon}
            >
              Entity
            </ButtonIcon> */}
            </div>
          </>
        )}
      </header>

      <RenderModal>
        {confirmModal && <ConfirmModal {...confirmModal} />}
      </RenderModal>
    </>
  )
}
