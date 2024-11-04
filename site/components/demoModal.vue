<template>
    <div v-if="show" @click="closeModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
        <div @click.stop class="w-[55vw] h-[65vh] bg-gray-200 rounded-3xl shadow-lg flex overflow-hidden">
            <div class="w-[55%] h-full flex flex-col justify-between p-6 overflow-y-scroll">
                <div class="flex flex-col gap-2">
                    <h1 class="text-4xl font-semibold mb-4">{{ title }}</h1>
                    <div class="w-full h-[2px] bg-gray-500 bg-opacity-50 mb-3"></div>
                    <p class="pb-6">{{ description }}</p>
                </div>
                <div class="flex flex-col gap-5">
                    <div class="w-full h-[2px] bg-gray-500 bg-opacity-50"></div>
                </div>
            </div>
            <div class="w-[45%] h-full bg-cover bg-center" :style="{ backgroundImage: `url(${sideImage})` }"></div>
        </div>
    </div>
</template>
  
<script>
    export default {
        props: {
            show: {
                type: Boolean,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            sideImage: {
                type: String,
                required: true
            },
        },
        methods: {
            closeModal() {
                this.$emit('close');
            }
        }
    };
</script>