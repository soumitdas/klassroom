<template>
  <section class="section">
    <title-bar>
      {{$route.meta.title}}
      <b-button type="is-primary" icon-left="refresh" slot="button">Refresh</b-button>
    </title-bar>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'

export default {
    name: 'Settings',
    components: { TitleBar },
}
</script>

<style>

</style>