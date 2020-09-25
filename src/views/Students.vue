<template>
  <section class="section">
    <title-bar>
      {{this.$route.meta.title}}
      <div class="buttons" slot="button">
        <b-button type="is-primary" icon-left="import">Import</b-button>
        <b-button type="is-primary" icon-left="plus" @click="showNewForm">New</b-button>
      </div>
    </title-bar>

    <card-component class="has-table" title="Student Table" icon="account-multiple" headerIcon="refresh" @header-icon-click="fetchStudents">
      <b-table
        :checkable="true"
        :loading="isLoading"
        :paginated="students.length > perPage"
        :per-page="perPage"
        :striped="false"
        :hoverable="true"
        default-sort="univRoll"
        :data="students">

        <template slot-scope="props">
          <b-table-column label="University Roll" field="univRoll" sortable>
            {{ props.row.univRoll }}
          </b-table-column>
          <b-table-column label="Class Roll" field="classRoll" sortable>
            {{ props.row.classRoll }}
          </b-table-column>
          <b-table-column label="Name" field="name" sortable>
            {{ props.row.name }}
          </b-table-column>
          <b-table-column label="Batch" field="batch">
            {{ props.row.batch }}
          </b-table-column>
          <b-table-column label="Department" field="dept">
            {{ props.row.dept }}
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
      <student-form :data="currentItem" :isEditing="isEditing"></student-form>
    </b-modal>

  </section>
</template>

<script>
//import StudentTable from '@/components/StudentTable'
import CardComponent from '@/components/CardComponent'
import TitleBar from '@/components/TitleBar'
import StudentForm from '@/components/StudentForm'
import {db} from '../firebase'
import {mapState, mapActions} from 'vuex'

export default {
  name: 'Tables',
  components: { TitleBar, CardComponent, StudentForm },
  data() {
    return {
      currentItem: null,
      isFormVisible: false,
      isEditing: false,
      isLoading: false,
      perPage: 10,
    }
  },
  computed: {
    ...mapState(['students'])
  },
  methods: {
    ...mapActions(['fetchStudents']),
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