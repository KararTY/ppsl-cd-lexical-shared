import { EntityContainerNode } from '../plugins/EntityContainer/node'
import { EntityImageNode } from '../plugins/EntityImage/node'
import { EntityLongDescriptionNode } from '../plugins/EntityLongDescription/node'
import { EntityMentionNode } from '../plugins/EntityMention/node'
import { EntityShortDescriptionNode } from '../plugins/EntityShortDescription/node'

/**
 * @param {any} theme
 * @param {boolean} readOnly
 * @returns {import("@lexical/react/LexicalComposer").InitialConfigType}
 */
export const entityConfig = (theme, editable) => ({
  // The editor theme
  theme,
  // Handling of errors during update
  onError (error) {
    throw error
  },
  // Any custom nodes go here
  nodes: [
    EntityContainerNode,
    EntityImageNode,
    EntityShortDescriptionNode,
    EntityLongDescriptionNode,
    EntityMentionNode
  ],
  editable
})
