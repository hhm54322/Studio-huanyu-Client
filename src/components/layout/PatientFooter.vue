<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Globe, Mail, Phone, MapPin } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <footer class="text-white" style="background: linear-gradient(to bottom right, #7B341E, #C05621)">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- 品牌列 -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              寰
            </div>
            <span class="text-lg font-bold">寰宇云医</span>
          </div>
          <p class="text-orange-100 text-sm leading-relaxed">
            {{ t('footer.desc') }}
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h4 class="font-semibold mb-4">{{ t('footer.links') }}</h4>
          <ul class="space-y-2 text-sm text-orange-100">
            <li>
              <router-link to="/" class="hover:text-white transition-colors">
                {{ t('nav.home') }}
              </router-link>
            </li>
            <li>
              <router-link to="/cost" class="hover:text-white transition-colors">
                {{ t('nav.cost') }}
              </router-link>
            </li>
            <li>
              <router-link to="/report" class="hover:text-white transition-colors">
                {{ t('nav.report') }}
              </router-link>
            </li>
            <li>
              <router-link to="/hospitals" class="hover:text-white transition-colors">
                {{ t('nav.hospitals') }}
              </router-link>
            </li>
            <li>
              <router-link to="/cases" class="hover:text-white transition-colors">
                {{ t('nav.cases') }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 服务项目 -->
        <div>
          <h4 class="font-semibold mb-4">服务项目</h4>
          <ul class="space-y-2 text-sm text-orange-100">
            <li>来华就医预审报告</li>
            <li>专家视频面诊</li>
            <li>医院预约与签证协助</li>
            <li>全流程就医陪诊</li>
            <li>术后跨境随访</li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div>
          <h4 class="font-semibold mb-4">{{ t('footer.contact') }}</h4>
          <ul class="space-y-3 text-sm text-orange-100">
            <li class="flex items-center gap-2">
              <Mail class="h-4 w-4 shrink-0" />
              <span>contact@huanyuyunyi.com</span>
            </li>
            <li class="flex items-center gap-2">
              <Phone class="h-4 w-4 shrink-0" />
              <span>+86 400-888-XXXX</span>
            </li>
            <li class="flex items-center gap-2">
              <MapPin class="h-4 w-4 shrink-0" />
              <span>中国 · 北京 / 上海</span>
            </li>
            <li class="flex items-center gap-2">
              <Globe class="h-4 w-4 shrink-0" />
              <span>www.huanyuyunyi.com</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权 -->
      <div class="mt-10 pt-6 border-t border-white/20 text-center text-sm text-orange-100">
        <p>{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>
