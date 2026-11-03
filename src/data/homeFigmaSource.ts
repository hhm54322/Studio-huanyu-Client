import { homeDesktopNodes, homeMobileNodes, indexHomeSource as indexTree, restoreHomeEntrySources } from './homeSourceRegistry'
import desktopSource from '../../docs/figma-source/home/source-tree-2026-10-19.json'
import mobileSource from '../../docs/figma-source/home/source-tree-mobile-2026-10-19.json'
import journeySource from '../../docs/figma-source/home/journey-states/source-tree-2026-10-19.json'
import strength02Source from '../../docs/figma-source/home/strength-02/source-tree-2026-10-19.json'
import strength03Source from '../../docs/figma-source/home/strength-03/source-tree-2026-10-19.json'
import storyPhotoSources from '../../docs/figma-source/home/story-carousel/source-trees-2026-10-29.json'

export { homeDesktopNodes, homeMobileNodes }
indexTree(desktopSource.root, homeDesktopNodes)
indexTree(journeySource.root, homeDesktopNodes)
indexTree(strength02Source.root, homeDesktopNodes)
indexTree(strength03Source.root, homeDesktopNodes)
for (const source of storyPhotoSources.sets) indexTree(source.root, homeDesktopNodes)
export const homeStoryPhotoIds = ['1466:843', '1412:5862', '1466:848', '1466:850', '1466:852']
export const homeStoryDetailPhotoIds = ['1407:20', '1466:856', '1466:865', '1466:866', '1466:867']
indexTree(mobileSource.root, homeMobileNodes)
// Entry states are already loaded; preserve their original override order
// without downloading a second copy in the deferred page bundle.
restoreHomeEntrySources()
export const homeSourceText = (id:string) => (homeDesktopNodes.get(id) || homeMobileNodes.get(id))?.text || ''
