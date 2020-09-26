<template>
  <section class="section">
    <title-bar>
      {{this.$route.meta.title}}
      <div class="buttons" slot="button">
        <b-button type="is-primary" icon-left="import">Import</b-button>
        <b-button type="is-primary" icon-left="plus" @click="showNewForm">New</b-button>
      </div>
    </title-bar>

    <div class="level">
      <div class="level-left">
        <b-field grouped>
          <p class="control">
              <b-switch v-model="searchable">
                  Searchable
              </b-switch>
          </p>
        </b-field>
      </div>
      <div class="level-right">
        <b-field grouped>
          <b-select v-model="perPage">
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="20">20 per page</option>
            <option value="30">30 per page</option>
            <option value="50">50 per page</option>
          </b-select>
        </b-field>
      </div>
    </div>

    <card-component class="has-table" title="Teacher Table" icon="account-multiple" headerIcon="refresh" @header-icon-click="fetchTeachers">
      <b-table
        :checkable="true"
        :loading="isLoading"
        :paginated="teachers.length > perPage"
        :per-page="perPage"
        :striped="false"
        :hoverable="true"
        :mobile-cards="false"
        default-sort="univRoll"
        :data="teachers">

        <template slot-scope="props">
          <b-table-column label="Name" field="name" :searchable="searchable" sortable>
            {{ props.row.name }}
          </b-table-column>
          <b-table-column label="Department" field="dept">
            {{ props.row.dept }}
          </b-table-column>
          <b-table-column label="Email" field="email">
            {{ props.row.email }}
          </b-table-column>
          <b-table-column custom-key="actions" class="is-actions-cell">
            <div class="buttons is-right">
              <button class="button is-small is-primary" type="button" @click.prevent="showEditForm(props.row)">
                <b-icon icon="eye" custom-size="default"/>
              </button>
              <button class="button is-small is-danger" type="button" @click.prevent="showDeletePrompt(props.row)">
                <b-icon icon="trash-can" custom-size="default"/>
              </button>
            </div>
          </b-table-column>
        </template>

        <section class="section" slot="empty">
          <div class="content has-text-grey has-text-centered">
            <template v-if="isLoading">
              <p>
                <b-icon icon="dots-horizontal" size="is-large"/>
              </p>
              <p>Fetching data...</p>
            </template>
            <template v-else>
              <p>
                <b-icon icon="emoticon-sad" size="is-large"/>
              </p>
              <p>Nothing's there&hellip;</p>
            </template>
          </div>
        </section>
      </b-table>
    </card-component>

    <b-modal :aria-modal="true" :active.sync="isFormVisible" :width="600">
      <teacher-form :data="currentItem" :isEditing="isEditing"></teacher-form>
    </b-modal>

  </section>
</template>

<script>
import CardComponent from '@/components/CardComponent'
import TitleBar from '@/components/TitleBar'
import TeacherForm from '@/components/TeacherForm'
import {db} from '../firebase'
import {mapState, mapActions} from 'vuex'

export default {
  name: 'Tables',
  components: { TitleBar, CardComponent, TeacherForm },
  data() {
    return {
      currentItem: null,
      isFormVisible: false,
      isEditing: false,
      isLoading: false,
      perPage: 10,
      searchable: false
    }
  },
  computed: {
    ...mapState(['teachers'])
  },
  methods: {
    ...mapActions(['fetchTeachers']),
    showNewForm() {
      this.currentItem = {}
      this.isFormVisible = true
      this.isEditing = false
    },
    showEditForm(sub) {
      this.currentItem = sub
      this.isFormVisible = true
      this.isEditing = true
    },
    showDeletePrompt(user) {
      this.$buefy.dialog.confirm({
        title: 'Confirm action',
        message: `This will permanently delete <b>${user.name}</b><br>This action can not be undone.`,
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.deleteStudent(user)
      })
    },
    deleteStudent(user) {
      db.collection('users').doc(user.uid).delete()
        .then(() => {
          this.$store.commit('deleteStudent', user.uid)
          this.$buefy.toast.open({
          message: `${user.name} deleted`,
          type: "is-danger",
          queue: false
          })
        })
        .catch(error => this.$buefy.toast.open({
          message: `Error: ${error.message}`,
          type: "is-danger",
          queue: false
        }))
    }
  }
}
</script>