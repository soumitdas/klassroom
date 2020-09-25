<template>
  <card-component title="Change Password" icon="lock">
    <form @submit.prevent="submit">
      <b-field horizontal label="Current password">
        <b-input name="password_current" type="password" v-model="form.password_current" required />
      </b-field>
      <hr>
      <b-field horizontal label="New password">
        <b-input name="password" type="password" v-model="form.password" required />
      </b-field>
      <b-field horizontal label="Confirm password">
        <b-input name="password_confirmation" type="password" v-model="form.password_confirmation" required />
      </b-field>
      <hr>
      <b-field horizontal>
        <div class="control">
          <button type="submit" class="button is-primary" :class="{'is-loading':isLoading}">
            Submit
          </button>
        </div>
      </b-field>
    </form>
  </card-component>
</template>

<script>
import CardComponent from '@/components/CardComponent'
import {auth, firebase} from '../firebase'
export default {
  name: 'PasswordUpdateForm',
  components: {
    CardComponent
  },
  data () {
    return {
      isLoading: false,
      form: {
        password_current: null,
        password: null,
        password_confirmation: null
      }
    }
  },
  methods: {
    submit () {
      this.isLoading = true
      if (this.form.password === this.form.password_confirmation) {
        const user = auth.currentUser
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.form.password_current)
        user.reauthenticateWithCredential(credential)
          .then(() => user.updatePassword(this.form.password))
          .then(() => {
            this.isLoading = false
            this.clearForm()
            this.$buefy.snackbar.open({
              message: 'Password Updated',
              queue: false
            }, 500)
          })
          .catch(e => {
            this.isLoading = false
            this.clearForm()
            this.$buefy.snackbar.open({
              message: `Error: ${e.message}`,
              queue: false
            }, 500)
          })
      } else {
        this.isLoading = false
        this.$buefy.snackbar.open({
          message: 'Error: Password do not matched',
          queue: false
        }, 500)
      }
    },
    clearForm() {
      this.form.password_current = null,
      this.form.password = null,
      this.form.password_confirmation = null
    }
  },
}
</script>
