import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import desktopSource from '../../docs/figma-source/home/source-tree-2026-10-19.json'
import mobileSource from '../../docs/figma-source/home/source-tree-mobile-2026-10-19.json'
import journeySource from '../../docs/figma-source/home/journey-states/source-tree-2026-10-19.json'
import strength02Source from '../../docs/figma-source/home/strength-02/source-tree-2026-10-19.json'
import strength03Source from '../../docs/figma-source/home/strength-03/source-tree-2026-10-19.json'
import hero01Source from '../../docs/figma-source/home/hero-01/source-tree-2026-10-19.json'
import hero02Source from '../../docs/figma-source/home/hero-02/source-tree-2026-10-19.json'
import hero03Source from '../../docs/figma-source/home/hero-03/source-tree-2026-10-19.json'
import storyDetailSource from '../../docs/figma-source/home/story-02/source-tree-2026-10-19.json'
import storyDetailScrollSource from '../../docs/figma-source/home/story-03/source-tree-2026-10-19.json'
import why01Source from '../../docs/figma-source/home/why-01/source-tree-2026-10-19.json'
import why02Source from '../../docs/figma-source/home/why-02/source-tree-2026-10-19.json'
import why03Source from '../../docs/figma-source/home/why-03/source-tree-2026-10-19.json'
import why04Source from '../../docs/figma-source/home/why-04/source-tree-2026-10-19.json'
import why05Source from '../../docs/figma-source/home/why-05/source-tree-2026-10-19.json'
import why06Source from '../../docs/figma-source/home/why-06/source-tree-2026-10-19.json'
import whyMobile01Source from '../../docs/figma-source/home/why-mobile-01/source-tree-2026-10-19.json'
import whyMobile02Source from '../../docs/figma-source/home/why-mobile-02/source-tree-2026-10-19.json'
import whyMobile03Source from '../../docs/figma-source/home/why-mobile-03/source-tree-2026-10-19.json'
import whyMobile04Source from '../../docs/figma-source/home/why-mobile-04/source-tree-2026-10-19.json'
import whyMobile05Source from '../../docs/figma-source/home/why-mobile-05/source-tree-2026-10-19.json'
import whyMobile06Source from '../../docs/figma-source/home/why-mobile-06/source-tree-2026-10-19.json'
import storyMobileSource from '../../docs/figma-source/home/story-mobile/source-tree-2026-10-19.json'
import navigationMobileSource from '../../docs/figma-source/home/navigation-mobile/source-tree-2026-10-19.json'
import navigationMobileLanguageSource from '../../docs/figma-source/home/navigation-mobile-language/source-tree-2026-10-19.json'
import currentHeroSource from '../../docs/figma-source/home/revision-2026-10-28/hero/source-tree-2026-10-28.json'
import storyPhotoSources from '../../docs/figma-source/home/story-carousel/source-trees-2026-10-29.json'

function indexTree(node: HomeSourceNodeData, map = new Map<string, HomeSourceNodeData>()) {
  map.set(node.id, node)
  node.children.forEach(child => indexTree(child, map))
  return map
}
export const homeDesktopNodes = indexTree(desktopSource.root)
indexTree(journeySource.root, homeDesktopNodes)
indexTree(strength02Source.root, homeDesktopNodes)
indexTree(strength03Source.root, homeDesktopNodes)
for (const source of [hero01Source,hero02Source,hero03Source,storyDetailSource,storyDetailScrollSource,why01Source,why02Source,why03Source,why04Source,why05Source,why06Source]) indexTree(source.root, homeDesktopNodes)
indexTree(currentHeroSource.root, homeDesktopNodes)
for (const source of storyPhotoSources.sets) indexTree(source.root, homeDesktopNodes)
export const homeStoryPhotoIds = ['1466:843', '1412:5862', '1466:848', '1466:850', '1466:852']
export const homeStoryDetailPhotoIds = ['1407:20', '1466:856', '1466:865', '1466:866', '1466:867']
export const homeMobileNodes = indexTree(mobileSource.root)
for (const source of [whyMobile01Source,whyMobile02Source,whyMobile03Source,whyMobile04Source,whyMobile05Source,whyMobile06Source,storyMobileSource,navigationMobileSource,navigationMobileLanguageSource]) indexTree(source.root, homeMobileNodes)
export const homeSourceText = (id:string) => (homeDesktopNodes.get(id) || homeMobileNodes.get(id))?.text || ''
