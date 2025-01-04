import { base64ToUint8Array } from 'uint8array-extras'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'

import { updateToJSON } from './yjs'
import { toHTML } from './lexicalHTML'

import { defaultTheme, readOnlyTheme } from '../editors/theme'
import { entityConfig } from '../editors/Entity/config'
import { bioConfig } from '../editors/Bio/config'
import { SYSTEM_IDS } from '../editors/constants'

const { ENTITY, BIO, REVIEW } = SYSTEM_IDS

const theme = { ...defaultTheme, ...readOnlyTheme }

function onError (error) {
  throw error
}

const configs = {
  [ENTITY]: {
    config: entityConfig(theme, false, null, onError)
  },
  [BIO]: {
    config: bioConfig(theme, false, null, onError)
  },
  [REVIEW]: {
    config: bioConfig(theme, false, null, onError)
  }
}

export const YjsToHTML = forwardRef(
  ({ update, type, className = '', handleIsEmpty }, ref) => {
    const [html, setHTML] = useState('<span>Loading...</span>')

    const callbackHandleIsEmpty = useCallback(handleIsEmpty, [handleIsEmpty])

    const memoizedInitialContent = useMemo(() => update, [update])

    useEffect(() => {
      (async function () {
        if (!memoizedInitialContent) {
          setHTML('')
          callbackHandleIsEmpty?.(true)
          return
        }

        const { config } = configs[type]

        const editorState = updateToJSON(config, base64ToUint8Array(update))
        const htmlRes = await toHTML(JSON.stringify(editorState), type)

        if (htmlRes.length > 0) {
          setHTML(htmlRes)
        } else {
          setHTML('')
          callbackHandleIsEmpty?.(true)
        }
      })()
    }, [memoizedInitialContent, callbackHandleIsEmpty, update, type])

    return (
      html && (
        <div
          className={className}
          ref={ref}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    )
  }
)

YjsToHTML.displayName = 'YjsToHTML'
