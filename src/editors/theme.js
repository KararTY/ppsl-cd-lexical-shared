const entityClassesDefault = {
  entityContainer:
    'flex flex-col sm:!grid gap-3 grid-cols-[auto_1fr] grid-rows-[repeat(3,_auto)] mb-2 last:mb-0',
  /* 1 / 1 / 3 / 2 */
  entityImage: 'row-start-1 col-start-1 row-end-3 col-end-2',
  /* 1 / 2 / 2 / 3 */
  entityShortDescription: 'row-start-1 col-start-2 row-end-2 col-end-3',
  /* 2 / 2 / 3 / 3 */
  entityLinks: 'row-start-2 col-start-2 row-end-3 col-end-3',
  /* 3 / 1 / 4 / 3 */
  entityLongDescription: 'row-start-3 col-start-1 row-end-4 col-end-3'
}

export const defaultTheme = {
  paragraph: 'mb-4 last:mb-0',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    code: 'p-1 bg-slate-900 bg-opacity-5'
  },
  entityContainer: entityClassesDefault.entityContainer,
  entityMention: 'text-blue-500 underline decoration-blue-500'
}

export const editableEditorTheme = {
  article: 'relative m-0 p-0',
  body: 'relative bg-slate-900 bg-opacity-5 dark:bg-opacity-50',
  contentEditable: 'min-h-[150px] p-3 focus-visible:outline-none',
  entityImage: `${entityClassesDefault.entityImage} after:content-['Edit_image'] after:absolute after:font-bold after:inset-y-0 after:inset-x-0 after:flex after:justify-center after:items-center after:bg-black after:bg-opacity-50 after:text-white after:z-10 hover:bg-black relative hover:cursor-pointer p-4 h-48 w-48 bg-opacity-5 bg-gray-500 rounded-xl overflow-hidden`,
  entityShortDescription: `${entityClassesDefault.entityShortDescription} relative before:content-['Short_description'] before:absolute before:text-xs before:italic before:pl-2 before:top-0 before:left-0 pt-4 p-2 bg-opacity-5 bg-gray-500`,
  entityLinks: `${entityClassesDefault.entityLinks} p-2 bg-opacity-5 bg-gray-500`,
  entityLongDescription: `${entityClassesDefault.entityLongDescription} relative before:content-['Long_description'] before:absolute before:text-xs before:italic before:pl-2 before:top-0 before:left-0 pt-4 p-2 bg-opacity-5 bg-gray-500`
}

export const readOnlyTheme = {
  article: 'relative m-0 p-0 shadow-none',
  body: 'relative',
  contentEditable: '',
  entityImage: `${entityClassesDefault.entityImage} p-4`,
  entityShortDescription: `${entityClassesDefault.entityShortDescription} p-4`,
  entityLinks: `${entityClassesDefault.entityLinks} p-4`,
  entityLongDescription: `${entityClassesDefault.entityLongDescription} p-4`
}
