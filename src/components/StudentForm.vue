<template>
  <form @submit.prevent="onSubmit">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p v-if="isEditing" class="modal-card-title">Edit Student Details</p>
        <p v-else class="modal-card-title">Add New Student</p>
        <p v-if="isEditing" class="has-text-grey is-size-7"><b>User ID</b>: {{ data.uid }}</p>
      </header>
      <section class="modal-card-body">
        <b-field label="University Roll-No" label-position="on-border">
          <b-input v-model="form.univRoll" :maxlength="11" placeholder="eg 11700115001" required></b-input>
        </b-field>

        <b-field label="Class Roll-No" label-position="on-border">
          <b-input v-model="form.classRoll" :maxlength="11" placeholder="eg AEIE2015001" required></b-input>
        </b-field>

        <b-field label="Name" label-position="on-border">
          <b-input v-model="form.name" :maxlength="200" placeholder="Enter Student Name" required></b-input>
        </b-field>

        <b-field label="E-mail" label-position="on-border">
          <b-input :maxlength="200" v-model="form.email" placeholder="name@example.com" required></b-input>
        </b-field>

        <b-field label="Mobile" label-position="on-border">
          <b-input
            :maxlength="10"
            v-model="form.mobile"
            placeholder="Student Mobile Number"
          ></b-input>
        </b-field>

        <b-field label="Department" label-position="on-border">
          <b-select v-model="form.dept" placeholder="Select the Department" required>
            <option value="AEIE">AEIE</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
            <option value="EE">EE</option>
            <option value="MCA">MCA</option>
          </b-select>
        </b-field>

        <b-field label="Batch" label-position="on-border">
          <b-input
            v-model="form.batch"
            :maxlength="4"
            placeholder="Enter the Passout year (eg 2015)"
            required>
          </b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot has-text-right">
        <b-button @click="$parent.close()">Close</b-button>
        <b-button native-type="submit" type="is-primary" :disabled="!hasFormChanged" :loading="isButtonLoading">{{ isEditing ? 'Update' : 'Save'}}</b-button>
      </footer>
    </div>
  </form>
</template>

<script>
import { db, functions } from "../firebase";

export default {
  name: "StudentFrom",
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    isEditing: Boolean,
  },
  data() {
    return {
      form: {},
      formCopy: '',
      isButtonLoading: false
    };
  },
  computed: {
    hasFormChanged() {
      return this.$props.isEditing ? JSON.stringify(this.form) !== this.formCopy : true
    }
  },
  methods: {
    onSubmit() {
      if (this.isEditing) {
        this.updateStudent()
        return
      }
      this.addStudent()
    },
    addStudent() {
      this.isButtonLoading = true
      const data = {
        univRoll: this.form.univRoll,
        classRoll: this.form.classRoll,
        name: this.form.name,
        email: this.form.email,
        mobile: this.form.mobile ? this.form.mobile : null,
        dept: this.form.dept,
        batch: this.form.batch
      }
      const createUser = functions.httpsCallable("createUser")
      createUser({ role: "student", data })
        .then(({data}) => {
          this.$store.dispatch('addStudent', data.userId)
          this.onSuccess("created")
        })
        .catch(e => this.onFailure(e))
    },
    updateStudent() {
      this.isButtonLoading = true
      const uid = this.data.uid
      const editData = {
        univRoll: this.form.univRoll,
        classRoll: this.form.classRoll,
        name: this.form.name,
        email: this.form.email,
        mobile: this.form.mobile ? this.form.mobile : null,
        dept: this.form.dept,
        batch: this.form.batch
      }
      db.collection("users").doc(uid).update({ studentData: editData })
        .then(() => {
          this.$store.commit('addOrUpdateStudent', {uid, ...editData})
          this.onSuccess("updated")
        })
        .catch(e => this.onFailure(e))
    },
    onSuccess(event) {
      this.isButtonLoading = false;
      this.$parent.close();
      this.$buefy.toast.open({
        message: `Student ${event} successfully`,
        type: "is-success",
        queue: false
      })
    },
    onFailure(error) {
      this.isButtonLoading = false;
      this.$buefy.toast.open({
        message: `Error: ${error.message}`,
        type: "is-danger",
        queue: false
      })
    }
  },
  mounted() {
    if (this.$props.isEditing) {
      this.form = {
        ...this.$props.data
      }
      this.formCopy = JSON.stringify(this.form)
    }
  }
};
</script>
