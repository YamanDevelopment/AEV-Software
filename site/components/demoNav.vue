<template>
    <div class="flex flex-col gap-2">
        <div v-if="openNote" class="flex flex-col justify-center items-center gap-3 p-4 bg-gray-200 rounded-lg">
            <NuxtLink class="hover:scale-110 transition-all" to="/" >🏠︎</NuxtLink>
            <button v-if="enableNote" class="hover:scale-110 transition-all" @click="openNote">📜</button>
        </div>
        <div class="flex flex-col justify-center items-center gap-3 p-4 bg-gray-200 rounded-lg">
            <NuxtLink class="hover:scale-110 transition-all" to="/main">🚀</NuxtLink>
            <NuxtLink class="hover:scale-110 transition-all" to="/cameras">📷</NuxtLink>
            <NuxtLink class="hover:scale-110 transition-all" to="/debug">👩🏻‍💻</NuxtLink>
            <NuxtLink class="hover:scale-110 transition-all" to="/gallery">🖼️</NuxtLink>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        enableNote: {
            required: false,
            default: true
        },
        openNote: {
            required: false
        }
    }
}
</script>