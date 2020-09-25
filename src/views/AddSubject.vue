<template>
  <section class="section">
    <title-bar>
        {{this.$route.meta.title}}
        <router-link to="/subjects" class="button is-primary" slot="button">
        Back
        </router-link>
    </title-bar>

    <card-component title="Add New Subject" icon="text-subject">
    <form @submit.prevent="submit">
        <b-field horizontal label="Subject Name" message="Required">
        <b-input name="subject_name" type="text" required/>
        </b-field>

        <b-field horizontal>
        <div class="control">
            <button type="submit" class="button is-primary" :class="{'is-loading':isLoading}">
            Submit
            </button>
        </div>
        </b-field>
    </form>
    </card-component>
  </section>
</template>

<script>
import TitleBar from '@/components/TitleBar'
import CardComponent from '@/components/CardComponent'

export default {
    components: { TitleBar, CardComponent }

}
</script>

<style>

</style>