<script>
    import Header from './Header.vue';
    import ImageUpload from './ImageUpload.vue';
    import Ocr from './Ocr.vue';
    import Tutorial from './Tutorial.vue';
    export default {
        components : {
            Header,
            ImageUpload,
            Ocr,
            Tutorial
        },
        data() {
          return {
            ocrData : null,
            step:0,
            percentage:0,
            documentId:null
          }
        },
        methods: {
          sendDataToOcr(data) {
            this.step = 1
            this.ocrData = data
          },
          selectionDone() {
            this.percentage = Math.round(this.step/3*100)
            this.step++

          },
          saveInfo(selectedBlocks, documentId) {
            this.documentId = documentId
            const data = {
              selectedBlocks:JSON.stringify(selectedBlocks),
              documentId:documentId
            }
            fetch('http://localhost:8080/api/save-selected-blocks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
            .then(res=> {
              return res.text()
            })
            .then(documentId => {
              
            })

          }
        }
    }
</script>

<template>
  <Ocr @saveInfo="saveInfo" :rawData="ocrData" :step="step"/>
    <el-container>
      <el-header>
        <Header/>
      </el-header>
      <el-main>
        <el-row>
          <el-col>
            <el-progress :percentage=percentage v-if="step>0 && percentage<=100"/>
          </el-col>
          <el-col>
            <Tutorial @selectionDone="selectionDone" :step=step />  
          </el-col>
        </el-row>
        <el-row v-if="ocrData">
          {{ocrData.documentId}}
        </el-row>
        <el-row>
          <ImageUpload @uploadDone="sendDataToOcr"/>
        </el-row>

      </el-main>
    </el-container>

  <main>
  </main>
</template>

<style scoped>

</style>