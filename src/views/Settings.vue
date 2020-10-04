<template>
  <section class="section">
    <title-bar>
      {{$route.meta.title}}
      <b-button type="is-primary" @click="fetchInstituteDetails" icon-left="refresh" slot="button">Refresh</b-button>
    </title-bar>

    <card-component title="Institute Details" icon="ballot">
      <form @submit.prevent="updateInstituteDetails">
        <b-field label="Institute Name" horizontal>
          <b-input v-model="institute.name" placeholder="XYZ Institute"></b-input>  
        </b-field>
        <b-field label="Institute Address" horizontal>
          <b-input v-model="institute.address" type="textarea"></b-input>
        </b-field>
        <b-field label="Institute Contact No" horizontal>
          <b-input v-model="institute.contactNo"></b-input>  
        </b-field>
        <b-field label="Institute Email" horizontal>
          <b-input v-model="institute.email"></b-input>  
        </b-field>
        <b-field :label="`Branch ${k+1}`" v-for="(branch,k) in institute.branches" :key="k" horizontal>
          <b-input placeholder="Branch Name" v-model="branch.name" expanded></b-input>
          <b-input placeholder="Branch Code" v-model="branch.code"></b-input>
          <p class="control">
            <b-button @click="remove(k)" v-show="k || ( !k && institute.branches.length > 1)" icon-left="book-minus">Remove</b-button>
          </p>
          <p class="control">
            <b-button @click="add()" v-show="k === institute.branches.length-1" icon-left="book-plus">Add</b-button>
          </p>
        </b-field>
        <b-field horizontal>
          <b-field>
            <b-button native-type="submit" type="is-primary" :loading="isLoading">Update</b-button>
          </b-field>
        </b-field>
      </form>
    </card-component>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
import CardComponent from '@/components/CardComponent'
import {mapState ,mapActions} from 'vuex'

import {db, firebase} from '../firebase'

export default {
    name: 'Settings',
    components: { TitleBar, CardComponent },
    data() {
      return {
        institute: {
          name: '',
          address: '',
          contactNo: '',
          email: '',

          branches: [{
            name: null,
            code: null
          }]
        },
        isLoading: false
      }
    },
    computed: {
      ...mapState(['instituteDetails']),
     
    },
    methods: {
      ...mapActions(['fetchInstituteDetails']),
      add() {
        this.institute.branches.push({ name: null, code: null });
      },
      remove(index) {
        this.institute.branches.splice(index, 1);
      },
      updateInstituteDetails() {
        this.isLoading = true

        const instituteData = {
          ...this.institute,
          modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
        //console.log(instituteData)

        db.doc('settings/institute')
          .set(instituteData, { merge: true })
          .then(() => this.onSuccess('updated'))
          .catch((e) => this.onFailure(e))
      },
      onSuccess(event) {
        this.isLoading = false
        this.$buefy.toast.open({
          message: `Settings ${event} successfully`,
          type: "is-success",
          queue: false
        })
        this.fetchInstituteDetails()
      },
      onFailure(error) {
        this.isLoading = false;
        this.$buefy.toast.open({
          message: `Error: ${error.message}`,
          type: "is-danger",
          queue: false
        })
      },
    },
    mounted() {
      if (this.instituteDetails) {
        const i = this.instituteDetails
        const institute = {
          name: i.name,
          address: i.address,
          contactNo: i.contactNo,
          email: i.email,
          branches: i.branches
        }
        this.institute = institute
      }
    }
}
</script>

<style>

</style>