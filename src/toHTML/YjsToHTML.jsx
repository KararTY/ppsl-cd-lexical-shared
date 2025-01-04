import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'

import { toHTML } from './lexicalHTML'

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

        const htmlRes = await toHTML({ update: memoizedInitialContent }, type)

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
