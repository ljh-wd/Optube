// Types for elements that can be detached/reattached in the DOM

export type DetachableElement = {
    parent: Node & ParentNode & { isConnected: boolean };
    nextSibling: ChildNode | null;
    element: Element;
};
