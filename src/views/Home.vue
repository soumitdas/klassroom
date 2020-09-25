<template>
  <section class="section hero is-fullheight">
    <div class="hero-body">
        <div class="container">
          <div class="section has-text-centered">
            <figure class="image is-64x64 is-inline-block">
              <img src="../assets/image/klassroom_logo.png" alt="Klassroom Logo">
            </figure>
            <h1 class="title">Klassroom</h1>
          </div>
          <div class="columns is-centered">
              <div class="column is-two-fifths">
                <div class="card">
                  <header class="card-header">
                    <p class="card-header-title">
                      <span class="icon"><i class="mdi mdi-lock default"></i></span> 
                      {{ isLoginForm ? 'Login' : 'Forgot Password' }}
                    </p>
                  </header>
                  <div class="card-content">
                    <login v-if="isLoginForm" />
                    <forgot-password v-else />
                  </div>
                  <footer class="card-footer">
                    <a href="javascript:void(0);" class="card-footer-item" @click="isLoginForm = !isLoginForm">{{ isLoginForm ? 'Forgot your Password?' : 'Back to Login' }}</a>
                  </footer>
                </div>
              </div>
          </div>
        </div>
    </div>
  </section>
</template>

<script>
import Login from '@/components/Login'
import ForgotPassword from '@/components/ForgotPassword'

export default {
  name: 'Home',
  components: { Login, ForgotPassword },
  data() {
    return {
      isLoginForm: true
    }
  }

}
</script>

<style>

</style>