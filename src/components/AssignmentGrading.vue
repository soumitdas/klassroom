<template>
    <div>
        <card-component class="has-table" title="Submissions" icon="clipboard-text" headerIcon="refresh" @header-icon-click="getAssignmentSubmissions">
            <b-table
                :checkable="false"
                :loading="isLoading"
                :paginated="submissions.length > perPage"
                :per-page="perPage"
                :striped="false"
                :hoverable="true"
                default-sort="univRoll"
                :data="submissions">

                <template slot-scope="props">
                <b-table-column label="University Roll" field="univRoll" sortable>
                    {{ props.row.student.univRoll }}
                </b-table-column>
                <b-table-column label="Class Roll" field="classRoll" sortable>
                    {{ props.row.student.classRoll }}
                </b-table-column>
                <b-table-column label="Name" field="name" sortable>
                    {{ props.row.student.name }}
                </b-table-column>
                <b-table-column label="Submitted Docs" field="attachments" centered>
                    <b-taglist>
                    <b-tag v-for="(attachment, i) in props.row.attachments" :key="i" size="is-medium" ellipsis>
                        <a :href="attachment.downloadUrl" target="_blank" rel="noopener noreferrer">{{ attachment.fileName }}</a>
                    </b-tag>
                    </b-taglist>
                </b-table-column>
                <!--<b-table-column label="Message" field="message">
                    {{ props.row.message }}
                </b-table-column>
                <b-table-column label="Submitted on" field="createdAt">
                    {{ props.row.createdAt.toLocaleString() }}
                </b-table-column>-->
                <b-table-column label="Grade" field="grade" sortable centered>
                    {{ props.row.grade }}
                </b-table-column>
                <b-table-column label="Remarks" field="remarks">
                    {{ props.row.remarks }}
                </b-table-column>
                <b-table-column label="Status" field="status" centered>
                    {{ props.row.isGraded ? 'Graded' : props.row.isReturned ? 'Returned' : 'Submitted' }}
                </b-table-column>
                <b-table-column custom-key="actions" class="is-actions-cell">
                    <div class="buttons is-right">
                    <button class="button is-small is-primary" type="button" @click="showForm(props.row)">
                        <b-icon icon="clipboard-check" custom-size="default"/>
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
            <assignment-grading-form :data="currentItem" @finished="getAssignmentSubmissions" />
        </b-modal>
    </div>
</template>

<script>
import CardComponent from '@/components/CardComponent'
import AssignmentGradingForm from '@/components/AssignmentGradingForm'

import {db} from '../firebase'
import {mapState} from 'vuex'

export default {
    name: 'AssignmentGrading',
    components: { CardComponent, AssignmentGradingForm },
    props: {
        subjectCode: {
            type: String,
            required: true
        },
        assignmentId: {
            type: String,
            required: true
        },
        totalMarks: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isLoading: false,
            perPage: 10,
            submissions: [],
            isFormVisible: false,
            currentItem: null
        }
    },
    computed: {
        ...mapState(['students'])
    },
    methods: {
        getAssignmentSubmissions() {
            this.isLoading = true
            let assignments = []
            db.doc(`subjects/${this.subjectCode}/assignments/${this.assignmentId}`)
                .collection('submissions').get()
                .then(snapshot => {
                    snapshot.forEach(snap => {
                        const data = snap.data()
                        const student = this.students.find(student => snap.id === student.uid)
                        assignments.push({
                            subjectCode: this.subjectCode,
                            assignmentId: this.assignmentId,
                            id: snap.id,
                            ...data,
                            student,
                            createdAt: data.createdAt.toDate(),
                            modifiedAt: data.modifiedAt.toDate(),
                        })
                    })
                    this.submissions = assignments
                    this.isLoading = false
                })
                .catch(() => {
                    this.isLoading = false
                })
        },
        showForm(sub) {
            this.currentItem = {
                ...sub,
                totalMarks: this.totalMarks
            }
            this.isFormVisible = true
        }
    },
    created() {
        this.getAssignmentSubmissions()
    }
}
</script>