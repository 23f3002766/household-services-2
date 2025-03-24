export default {
    props: ['columns', 'data'],
    template: `
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex">
              <td v-for="col in columns" :key="col.key" class="text-truncate" style="max-width: 350px; white-space: nowrap; " >
                <!-- If a slot with the column key exists, render that slot. Otherwise, show the property -->
                <slot :name="col.key" :row="row">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    watch: {
      data: {
        deep: true,
        handler(newData) {
          this.internalData = [...newData]; // Ensure table updates
        }
      }
    }

  };
  