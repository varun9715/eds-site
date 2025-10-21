// This class helps creating blocks in AEM using the provided block definition and properties.
// It utilizes the AEM Universal Editor to add blocks with specific configurations and properties.
// Default resource type='block', but can be overridden as 'Section', 'page', 'child' etc. if needed
// no need to pass resourceType if it is 'block' as it is default

class BlockBuilder {
  static create({
    blockDefinition,
    blockProps = '',
    aemManager,
    resourceType = 'block',
    parentResourceType = 'default',
  }) {
    const {
      id: blockId,
      plugins: { xwalk },
    } = blockDefinition;

    const { universalEditor, pageParentPath, pageLabel } = aemManager;

    const blockContent = {
      name: blockId,
      xwalk,
    };

    return cy.wrap(null).then(() =>
      universalEditor.add(
        blockId,
        pageParentPath,
        pageLabel,
        blockContent,
        blockProps, // No need to pass blockProps if block has no Properties to configure
        resourceType,
        parentResourceType,
      ),
    );
  }
}

export default BlockBuilder;
