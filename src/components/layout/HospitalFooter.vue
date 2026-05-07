<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Stethoscope, Phone, Mail, MapPin } from 'lucide-vue-next'

const router = useRouter()

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <footer class="bg-[#1A365D] text-white/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- 平台介绍 -->
        <div>
          <router-link to="/hospital" class="flex items-center gap-2 text-white font-bold text-lg mb-4">
            <Stethoscope class="w-6 h-6 text-[#D69E2E]" />
            <span>寰宇云医 · 医院版</span>
          </router-link>
          <p class="text-sm leading-relaxed text-white/70">
            零门槛触达全球市场，把过剩产能变成国际收入。我们为中国医院提供一站式国际化患者获取解决方案。
          </p>
        </div>

        <!-- 解决方案 -->
        <div>
          <h3 class="text-white font-semibold mb-4">解决方案</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/hospital/solutions" class="hover:text-[#D69E2E] transition-colors">
                AI智能患者匹配
              </router-link>
            </li>
            <li>
              <router-link to="/hospital/solutions" class="hover:text-[#D69E2E] transition-colors">
                全流程管理工具
              </router-link>
            </li>
            <li>
              <router-link to="/hospital/solutions" class="hover:text-[#D69E2E] transition-colors">
                数据洞察报告
              </router-link>
            </li>
            <li>
              <router-link to="/hospital/api" class="hover:text-[#D69E2E] transition-colors">
                API系统对接
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div>
          <h3 class="text-white font-semibold mb-4">联系方式</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-[#D69E2E] shrink-0" />
              <span>400-888-6688</span>
            </li>
            <li class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-[#D69E2E] shrink-0" />
              <span>hospital@huanyuyunyi.com</span>
            </li>
            <li class="flex items-start gap-2">
              <MapPin class="w-4 h-4 text-[#D69E2E] shrink-0 mt-0.5" />
              <span>北京市朝阳区望京SOHO T3</span>
            </li>
          </ul>
        </div>

        <!-- 法律条款 -->
        <div>
          <h3 class="text-white font-semibold mb-4">法律条款</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <span class="hover:text-[#D69E2E] transition-colors cursor-pointer">服务协议</span>
            </li>
            <li>
              <span class="hover:text-[#D69E2E] transition-colors cursor-pointer">隐私政策</span>
            </li>
            <li>
              <span class="hover:text-[#D69E2E] transition-colors cursor-pointer">数据安全承诺</span>
            </li>
            <li>
              <span class="hover:text-[#D69E2E] transition-colors cursor-pointer">合规资质</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权 -->
      <div class="border-t border-white/10 mt-10 pt-6 text-center text-sm text-white/50">
        <p>© 2025 寰宇云医 · 医院版 版权所有 | 京ICP备2025888888号</p>
      </div>
    </div>
  </footer>
</template>
