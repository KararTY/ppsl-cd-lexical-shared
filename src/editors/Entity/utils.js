export function titleFromURLString (urlStr) {
  return urlStr.length
    ? decodeURIComponent(
      urlStr
        .split('/')
        .pop()
        .replace(/_/g, ' ')
        .split('.')
        .slice(0, -1)
        .join()
    )
    : ''
}

export function getToolbarTitle (title, readOnly, post) {
  return title ?? `${!readOnly ? 'Editing ' : ''}${post.title || 'Post'}`
}
