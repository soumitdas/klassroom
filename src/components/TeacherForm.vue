<template>
  <form @submit.prevent="onSubmit">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p v-if="isEditing" class="modal-card-title">Edit Teacher Details</p>
        <p v-else class="modal-card-title">Add New Teacher</p>
        <p v-if="isEditing" class="has-text-grey is-size-7"><b>User ID</b>: {{ data.uid }}</p>
      </header>
      <section class="modal-card-body">
        <b-field label="Name" label-position="on-border">
          <b-input v-model="form.name" :maxlength="200" placeholder="Enter Teacher Name" required></b-input>
        </b-field>

        <b-field label="E-mail" label-position="on-border">
          <b-input :maxlength="200" v-model="form.email" placeholder="name@example.com" required></b-input>
        </b-field>

        <b-field label="Mobile" label-position="on-border">
          <b-input
            :maxlength="10"
            v-model="form.mobile"
            placeholder="Teacher Mobile Number"
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
  name: "TeacherFrom",
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
        this.updateTeacher()
        return
      }
      this.addTeacher()
    },
    addTeacher() {
      this.isButtonLoading = true
      const data = {
        name: this.form.name,
        email: this.form.email,
        mobile: this.form.mobile ? this.form.mobile : null,
        dept: this.form.dept
      }
      const createUser = functions.httpsCallable("createUser")
      createUser({ role: "teacher", data })
        .then(() => {
          this.onSuccess("created")
        })
        .catch(e => this.onFailure(e))
    },
    updateTeacher() {
      this.isButtonLoading = true
      const uid = this.data.uid
      const editData = {
        name: this.form.name,
        email: this.form.email,
        mobile: this.form.mobile ? this.form.mobile : null,
        dept: this.form.dept
      }
      db.collection("users").doc(uid).update({ teacherData: editData })
        .then(() => {
          this.$store.commit('addOrUpdateTeacher', {uid, ...editData})
          this.onSuccess("updated")
        })
        .catch(e => this.onFailure(e))
    },
    onSuccess(event) {
      this.isButtonLoading = false;
      this.$parent.close();
      this.$buefy.toast.open({
        message: `Teacher ${event} successfully`,
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
