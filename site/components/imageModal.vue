<template>
    <div v-if="show" @click="closeImageModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
        <div @click.stop class="bg-gray-200 shadow-lg flex overflow-hidden">
            <img class="max-w-[85vw] max-h-[90vh]" :src="imageSrc">
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
            imageSrc: {
                type: String,
                required: true
            }
        },
        methods: {
            closeImageModal() {
                this.$emit('close');
            }
        }
    };
</script>