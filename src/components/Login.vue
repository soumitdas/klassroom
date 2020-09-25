<template>
  <form @submit.prevent="doLogin">
    <b-field label="E-mail" label-position="on-border">
      <b-input size="is-medium" v-model="userEmail" type="email" placeholder="demo@example.com" required></b-input>
    </b-field>
    <b-field label="Password" label-position="on-border">
      <b-input size="is-medium" v-model="userPassword" type="password" placeholder="**********" required password-reveal></b-input>
    </b-field>
    <div class="control">
      <button type="submit" class="button is-primary" :class="{ 'is-loading' : isSubmitButtonLoading }">Login</button>
    </div>
  </form>
</template>

<script>
import {auth} from '../firebase'

export default {
  name: "LoginForm",
  data() {
    return {
      userEmail: '',
      userPassword: '', 
      isSubmitButtonLoading: false,
      nextUrl: '',
    }
  },
  created() {
    this.nextUrl = this.$route.query.next || '/dashboard'
  },
  methods: {
    doLogin() {
      this.isSubmitButtonLoading = true
      auth.signInWithEmailAndPassword(this.userEmail, this.userPassword)
      .then(() => {
        this.isSubmitButtonLoading = false
        this.$router.replace(this.nextUrl)
      })
      .catch((error) => {
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

