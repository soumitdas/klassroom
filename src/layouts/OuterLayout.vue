<template>
  <div id="outer-app">
      <slot/>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    this.$store.commit('hideAsideNavbar',true)
  }
}
</script>