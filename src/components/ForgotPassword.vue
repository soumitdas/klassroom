<template>
  <form @submit.prevent="forgotPassword">
    <b-field label="E-mail" label-position="on-border">
      <b-input size="is-medium" v-model="userEmail" type="email" placeholder="demo@example.com" required></b-input>
    </b-field>
    <div class="control">
      <button type="submit" class="button is-primary" :class="{ 'is-loading' : isSubmitButtonLoading }">Send Reset Link</button>
    </div>
  </form>
</template>

<script>
import {auth} from '../firebase'

export default {
  name: "ForgotPassword",
  data() {
    return {
      userEmail: '',
      isSubmitButtonLoading: false
    }
  },
  methods: {
    forgotPassword() {
      this.isSubmitButtonLoading = true
      const url = process.env.VUE_APP_BASE_URL
      auth.sendPasswordResetEmail(this.userEmail, { url , handleCodeInApp: false })
      .then(() => {
        this.isSubmitButtonLoading = false
        this.$buefy.toast.open({
            message: `Success: You will receive the password reset link in your email shortly`,
            duration: 4000,
            type: 'is-success'
          })
        this.userEmail = ''
      }).catch((error) => {
        this.isSubmitButtonLoading = false
        this.$buefy.toast.open({
            message: `Error: ${error.message}`,
            duration: 4000,
            type: 'is-danger'
          })
      });
      
    }
  }
};
</script>
