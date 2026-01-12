<template>
  <div id="health-care-home">
    <BRow>
      <BCol sm="12" class="mt-20 text-center mb-3 d-flex load-container">
        <div v-if="!showSpinner">
          <BButton variant="primary" @click="onGetDataClick" v-if="!btnGetDataCicked">Check Data</BButton>
          <BButton variant="success" @click="onSetDataClick" class="ml-3"
            v-if="!btnGetDataCicked && !btnSetDataClicked && dataProcessed">Upload Results</BButton>
        </div>
        <div v-else>
          <BSpinner variant="info" style="width: 3rem; height: 3rem" type="grow"> </BSpinner>
          <h5>Processing data...</h5>
        </div>
      </BCol>
    </BRow>

    <div v-show="dataProcessed">
      <p><strong>Data Quality Issues</strong></p>
      <p v-text="idDataQualityIssues"></p>
      <p><strong>Fever Patients</strong></p>
      <p v-text="idFeverPatients"></p>
      <p><strong>High Risk Patients</strong></p>
      <p v-text="idHighRiskPatients"></p>
    </div>

    <BAlert v-show="whoops" variant="danger" :model-value="true">
      <p>Something went wrong while fetching data, Try again!!!</p>
    </BAlert>

    <BAlert v-show="success" variant="success" :model-value="true">
      <p>Data saved successfully!!!</p>
    </BAlert>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from './../api'
import type { PatientResponse } from './../dataObjects/IPatientResponse'
import type { Patient } from '@/dataObjects/IPatient'
import algorithm from '@/Algorithm'

const btnGetDataCicked = ref(false)
const btnSetDataClicked = ref(false)
const showSpinner = ref(false)
const whoops = ref(false)
const dataProcessed = ref(false)
const success = ref(false)

const actualPage = ref(1)
const totalPages = ref(0)
const timeout = ref(3000)
const limitQuery = ref(20)

let patients: Array<Patient> = []
let idDataQualityIssues: Array<string> = []
let idFeverPatients: Array<string> = []
let idHighRiskPatients: Array<string> = []

const onGetDataClick = async function () {
  if (!btnGetDataCicked.value) {
    btnGetDataCicked.value = showSpinner.value = true
    dataProcessed.value = false
    try {
      resetValues()
      await fetchData()
      processingData()
      setTimeout(() => {
        dataProcessed.value = true
        btnGetDataCicked.value = showSpinner.value = false
      }, timeout.value)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      whoops.value = true
      setTimeout(() => {
        btnGetDataCicked.value = whoops.value = showSpinner.value = false
      }, timeout.value)
    }
  }
}

const onSetDataClick = async function () {
  btnSetDataClicked.value = showSpinner.value = true

  const results = {
    high_risk_patients: idHighRiskPatients,
    fever_patients: idFeverPatients,
    data_quality_issues: idDataQualityIssues,
  }

  const response = await api.post('/submit-assessment', JSON.stringify(results), {
    timeout: 10000,
  })

  console.log(response)
  if (response.success) success.value = true

  setTimeout(() => {
    btnSetDataClicked.value = showSpinner.value = success.value = false
  }, timeout.value)
}

async function fetchPatients(page: number): Promise<PatientResponse> {
  try {
    const response = await api.get<PatientResponse>(
      `/patients?page=${page}&limit=${limitQuery.value}`,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

async function fetchData() {
  const patientResponse = await fetchPatients(actualPage.value)
  const tmp = _.has(patientResponse, 'data') ? patientResponse.data : patientResponse.patients
  patients = _.concat<Patient>(patients, tmp)
  if (totalPages.value === 0) {
    totalPages.value = _.has(patientResponse, 'pagination')
      ? patientResponse.pagination.totalPages
      : Math.ceil(patientResponse.total_records / limitQuery.value)
  }
  await delay(800)
  actualPage.value++
  if (actualPage.value <= totalPages.value) await fetchData()
}

function processingData() {
  patients.forEach((patient) => {
    const result = algorithm.checkRiskScore(patient)
    if (result.hasFever) idFeverPatients.push(result.patient_id!)
    if (!_.isEmpty(result.errorCode)) idDataQualityIssues.push(result.patient_id!)
    if (result.hasHighRiskScore) idHighRiskPatients.push(result.patient_id!)
  })
}

function delay(ms: number | undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resetValues() {
  patients = []
  idDataQualityIssues = []
  idFeverPatients = []
  idHighRiskPatients = []
  actualPage.value = 1
}

onMounted(() => {
  console.log('component mounted')
})
</script>
<style lang="scss">
#health-care-home {
  .mt-20 {
    margin-top: 20px;
  }

  .load-container {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
