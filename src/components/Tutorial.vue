<script>
export default {
    props: ['step'],
    methods: {
        saveInfo(type, data) {
            console.log(`Type ${type}, data ${data}`);
        }
    },
    emits: [
        'selectionDone'
    ]

}
</script>

<template>
    <div v-if="step==1">
        Selectionnez vos informations personnelles
        <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
    </div>
    <div v-if="step==2">
        Selectionnez les données de contextes
        <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
    </div>
    <div v-if="step==3">
        Selectionnez les données du véhicule
        <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
    </div>
</template>

<style>

</style>
