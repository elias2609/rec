<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mx-auto max-w-3xl space-y-8">
    <article class="w-full max-w-prose mx-auto space-y-6">
      <!-- 1. Título e imagen -->
      <h1 class="text-3xl sm:text-4xl font-bold text-center text-primary">
        Ayudemos a Alexi a seguir latiendo
      </h1>
      <img src="@/assets/imagen.jpg" alt="Imagen del caso" class="w-full h-48 sm:h-64 object-cover rounded-lg" />
      <!-- 2. Texto explicativo con toggle -->
      <div class="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
        <p>
          Hace poco nos dieron una noticia que nos cambió la vida: mi papá tiene
          una miocardiopatía dilatada y su corazón ya está muy débil. Los médicos
          nos dijeron que la única manera de darle una nueva oportunidad es
          implantándole un marcapasos resincronizador.
        </p>

        <template v-if="showAll">
          <p>
            El costo del equipo y la cirugía es de 10.120 dólares, una cantidad que nuestra familia no puede cubrir
            sola. El procedimiento es urgente y cada día que pasa se hace más difícil.</p>
          <p>
            Mi papá es un hombre lleno de vida, trabajador, luchador y sobre todo un padre amoroso. Sueña con seguir
            viendo crecer a su familia y nosotros soñamos con tenerlo a nuestro lado por muchos años más.
          </p>
          <p>
            Hoy necesitamos de ti.
          </p>
          <p>
            Cualquier aporte, por pequeño que parezca, será un paso enorme para acercarnos al milagro de verlo sano. Y
            si no puedes donar, por favor ayúdanos compartiendo esta campaña para que llegue a más corazones solidarios.
          </p>
          <p>
            De antemano, gracias infinitas por tu apoyo, tus oraciones y por acompañarnos en este camino tan duro.
          </p>
          <p>
            Con tu ayuda, podemos darle a mi papá la oportunidad de seguir viviendo.
          </p>
        </template>

        <button @click="showAll = !showAll" class="text-primary font-medium hover:underline">
          {{ showAll ? 'Ver menos' : 'Ver más' }}
        </button>
      </div>

      <!-- 3. Total recaudado -->
      <section class="w-full text-center space-y-3">
        <h2 class="text-xl font-medium">Total recaudado</h2>
        <AmountCounter :amount="totalAmount" :duration="1500" class="mt-2" />

      </section>

      <!-- 4. Scroll infinito de donantes resumidos -->
      <DonationList :donations="donations" />

      <!-- 6. Lista completa de donaciones -->
      <div v-if="fullListVisible" class="space-y-1">
        <h2 class="text-xl font-semibold">Todas las donaciones</h2>
        <ul>
          <li v-for="d in fullList" :key="d.id" class="flex justify-between py-1 border-b">
            <span>{{ d.donor_name }}</span>
            <span>${{ d.amount.toLocaleString() }}</span>
          </li>
        </ul>
      </div>

      <!-- 7. Datos bancarios -->
      <div class="p-4 bg-gray-100 rounded">
        <h2 class="text-lg font-semibold mb-1">Cuenta para donar:</h2>
        <p>Banco: Mercantil (0105)</p>
        <p>Cuenta: 0105-0088-5370-8808-7294</p>
        <p>Cedula: 12678894</p>
        <p>Teléfono: 0426-4834147</p>
      </div>

      <!-- 8. Botón WhatsApp -->
      <div class="text-center">
        <a :href="whatsAppLink" target="_blank"
          class="inline-block bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600">
          Notificar donación por WhatsApp
        </a>
      </div>
      <!-- 9. Bloque para compartir campaña -->
<section class="mt-12 text-center">
  <!-- Título mejorado -->
  <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
    📣 Comparte esta campaña
  </h2>
  <p class="text-gray-600 text-base sm:text-lg mb-6">
    Ayúdanos a que más corazones solidarios se unan
  </p>

  <div class="flex justify-center space-x-4">
    <!-- WhatsApp -->
    <share-network
      network="whatsapp"
      :url="pageUrl"
      title="Hola, estoy apoyando esta recaudación de fondos…"
      description="¡Cada granito de arena cuenta!"
      v-slot="{ share }"
    >
      <button
        @click="share"
        class="flex items-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
      >
        <font-awesome-icon :icon="['fab', 'whatsapp']" class="mr-2 text-xl" />
        WhatsApp
      </button>
    </share-network>

    <!-- Facebook -->
    <share-network
      network="facebook"
      :url="pageUrl"
      title="Hola, estoy apoyando esta recaudación de fondos…"
      description="¡Cada granito de arena cuenta!"
      v-slot="{ share }"
    >
      <button
        @click="share"
        class="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
      >
        <font-awesome-icon :icon="['fab', 'facebook-f']" class="mr-2 text-xl" />
        Facebook
      </button>
    </share-network>

    <!-- Telegram -->
    <share-network
      network="telegram"
      :url="pageUrl"
      title="Hola, estoy apoyando esta recaudación de fondos…"
      description="¡Cada granito de arena cuenta!"
      v-slot="{ share }"
    >
      <button
        @click="share"
        class="flex items-center bg-[#0088CC] text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition"
      >
        <font-awesome-icon :icon="['fab', 'telegram']" class="mr-2 text-xl" />
        Telegram
      </button>
    </share-network>
  </div>
</section>




    </article>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase'
import AmountCounter from '@/components/AmountCounter.vue'
import DonationList from '@/components/DonationList.vue'

export default {
  components: { AmountCounter, DonationList },
  name: 'PublicView',
  data() {
    return {
      showAll: false,
      pageUrl: window.location.href,
      // Donaciones crudas y estructuras para scroll infinito
      donations: [],
      donorsSummary: [],
      displayedDonors: [],
      page: 1,
      pageSize: 10,
      loadingMore: false,

      // Control de vista completa y modal
      fullListVisible: false
    }
  },

  computed: {
    // ¿Necesita botón Ver más / Ver menos?
    needsToggle() {
      return this.fullText.length > this.summaryText.length
    },

    // Suma total de donaciones
    totalAmount() {
      return this.donations.reduce(
        (sum, { amount }) => sum + parseFloat(amount),
        0
      )
    },
    telegramBg() {
      return 'bg-[#0088CC] hover:bg-opacity-90'
    },

    // Lista completa ordenada por monto descendente
    fullList() {
      return [...this.donations].sort((a, b) => b.amount - a.amount)
    },

    // ¿Quedan más donantes por cargar?
    hasMore() {
      return this.displayedDonors.length < this.donorsSummary.length
    },

    // Link a WhatsApp (ajusta el número)
    whatsAppLink() {
      const msg = encodeURIComponent(
        `Hola, realice una doncion`
      )
      return `https://wa.me/584264834147?text=${msg}`
    }
  },

  async created() {
    // 1) Obtén todas las donaciones
    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_name, amount')

    if (error) {
      console.error('Error cargando donaciones:', error)
      return
    }

    // Parsear montos y guardar
    this.donations = data.map(d => ({
      ...d,
      amount: parseFloat(d.amount)
    }))

    // 2) Crear el resumen por donante
    const map = this.donations.reduce((acc, { donor_name, amount }) => {
      acc[donor_name] = (acc[donor_name] || 0) + amount
      return acc
    }, {})

    this.donorsSummary = Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)

    // 3) Inicializar scroll infinito
    this.displayedDonors = this.donorsSummary.slice(0, this.pageSize)
  },

  methods: {
    onScroll() {
      const c = this.$refs.scrollContainer
      if (!c || this.loadingMore || !this.hasMore) return

      if (c.scrollTop + c.clientHeight >= c.scrollHeight - 10) {
        this.loadMore()
      }
    },

    loadMore() {
      this.loadingMore = true
      setTimeout(() => {
        this.page++
        const start = (this.page - 1) * this.pageSize
        const next = this.donorsSummary.slice(start, start + this.pageSize)
        this.displayedDonors.push(...next)
        this.loadingMore = false
      }, 300)
    },

    toggleFullList() {
      this.fullListVisible = !this.fullListVisible
    },
    async shareCampaign() {
      const url = window.location.href
      const title = 'Ayudemos a Alexi a seguir latiendo'
      const text =
        'Únete a la campaña para apoyar a Alexi. ¡Cada aporte cuenta!'

      // Web Share API
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url })
        } catch (err) {
          // el usuario canceló o falló el share
          console.warn('Share canceled or failed:', err)
        }
        return
      }

      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(url)
        // Limpia el mensaje en 3s
      } catch (err) {
        console.error('Error copiando al portapapeles:', err)
      }

    }
  }
}
</script>