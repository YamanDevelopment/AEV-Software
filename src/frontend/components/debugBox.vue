<script setup>
    const props = defineProps(['protocol', 'intervalTime'])
    const messages = ref([props.protocol]);
</script>

<template>
    <div id="rawDataContainer" class="w-full h-full px-12 flex flex-col gap-3 overflow-scroll border-4 border-black rounded-xl">
        <p v-for="message in messages">
            {{ message }}
        </p>
    </div>
</template>

<script>
    export default {
        props: {
            protocol: {
                type: String
            },
            intervalTime: {
                type: Number
            }
        }
    }
</script>