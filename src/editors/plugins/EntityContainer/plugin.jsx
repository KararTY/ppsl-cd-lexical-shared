import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";

import { EntityImageNode } from "../EntityImage/node";
import { EntityShortDescriptionNode } from "../EntityShortDescription/node";
import { EntityLongDescriptionNode } from "../EntityLongDescription/node";

import { EntityContainerNode } from "./node";
import {
  registerInsertEntityContainerCommand,
  registerEntityNodeTransforms,
} from "./commands";

export function EntityContainerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (
      !editor.hasNodes([
        EntityContainerNode,
        EntityImageNode,
        EntityShortDescriptionNode,
        EntityLongDescriptionNode,
      ])
    ) {
      throw new Error(
        "EntityContainerPlugin: EntityContainerNode, EntityImageNode, EntityShortDescriptionNode or EntityLongDescriptionNode not registered on editor."
      );
    }

    return mergeRegister(
      registerInsertEntityContainerCommand(editor),
      registerEntityNodeTransforms(editor)
    );
  }, [editor]);

  return null;
}
