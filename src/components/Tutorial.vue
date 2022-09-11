<script>
export default {
    props: ['step', 'showPercentage'],
    methods: {
        saveInfo(type, data) {
            console.log(`Type ${type}, data ${data}`);
        }
    },
    emits: [
        'selectionDone',
    ]

}
</script>

<template>
    <el-row>
        <div v-if="step==1">
            Selectionnez vos informations personnelles
            <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
        </div>
    </el-row>
    <el-row>
        <div v-if="step==2">
            Selectionnez les données de contextes
            <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
        </div>
    </el-row>
    <el-row v-if="step==3">
        <div >
            Selectionnez les données du véhicule
            <el-button type="primary" @click="$emit('selectionDone')">Terminé</el-button>
        </div>
    </el-row>
    <el-row v-if="step==4">
        <el-button @click="$emit('selectionDone')">Enregistrer les informations</el-button>
    </el-row>

</template>

<style>

</style>
