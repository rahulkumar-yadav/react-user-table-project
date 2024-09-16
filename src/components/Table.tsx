
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Skeleton } from 'primereact/skeleton'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Pagination from './Pagination'
import down_icon from '../assets/chevron-down.svg'
import "primereact/resources/themes/lara-light-cyan/theme.css"

interface Row {
    index: number,
    id: number,
    title?: string,
    place_of_origin?: string,
    artist_display?: string,
    inscriptions?: string,
    date_start?: number,
    date_end?: number
}

function Table() {

    const [loading, setLoading] = useState<boolean>(true)
    const [rows, setRows] = useState<Row[]>([])
    const [page, setPage] = useState(0)
    const [selectedRows, setSelectedRows] = useState<Row[] | null>(null)
    const [totalRecords, setTotalRecords] = useState(1)
    const [input, setInput] = useState<string>('')
    const [rowsToSelect, setRowsToSelect] = useState<number>(0)
    const [avoidList, setAvoidList] = useState<number[]>([])
    const [count, setCount] = useState(0)

    const op = useRef<OverlayPanel>(null)

    const fetchTableData = useCallback(async (): Promise<void> => {
        const rowsPerPage = 12
        let first = page * rowsPerPage
        const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`)
        const resData = await res.json()
        const data = resData.data

        data.forEach((row: Row[]) => {
            if (!('index' in row)) {
                Object.defineProperty(row, 'index', { value: first })
                first++
            }
        })
        setRows(data)
        setTotalRecords(parseInt(resData.pagination.total))
        setLoading(false)
    }, [page])

    function submitHandler() {
        setRowsToSelect((parseInt(input)))
        op.current?.hide()
        setInput('')
    }

    function inputHandler(e: React.ChangeEvent<HTMLInputElement>) {
        if (parseInt(e.target.value) <= 0) {
            setInput('1')
        } else {
            setInput(e.target.value)
        }
    }

    const spanSelectedRowsAcrossPages = useCallback(() => {
        if (rowsToSelect === 0) {
            return
        }
        const newSelectedRows: Row[] = []
        rows.forEach(row => {
            if (row.index < rowsToSelect) {
                if (avoidList.includes(row.index)) {
                    return
                }
                newSelectedRows.push(row)
                setAvoidList(prev => [...prev, row.index])
                setCount(prev => prev + 1)
            }
            if (row.index >= rowsToSelect - 1 && count >= rowsToSelect) {
                setRowsToSelect(0)
                setAvoidList([])
                setCount(0)
            }
        })
        const prevRows = selectedRows || []
        const combinedRows = [...prevRows, ...newSelectedRows]
        const uniqueRows = Array.from(new Set(combinedRows.map(row => row.index)))
            .map(index => combinedRows.find(row => row.index === index) as Row)

        setSelectedRows(uniqueRows)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowsToSelect, rows])

    useEffect(() => {
        setLoading(true)
        fetchTableData()
    }, [fetchTableData])

    useEffect(() => {
        spanSelectedRowsAcrossPages()
    }, [spanSelectedRowsAcrossPages])

    const titleHeader = (
        <div className='title-header'>
            Title
            <button className='chevron-down' onClick={(e) => op.current?.toggle(e)}>
                <img src={down_icon} alt="chevron down icon" />
            </button>
            <OverlayPanel ref={op} >
                <div className='input-container'>
                    <input type='number' value={input} onChange={inputHandler} placeholder='Select rows...' />
                    <button onClick={submitHandler}>Submit</button>
                </div>
            </OverlayPanel>
        </div>
    )

    return (
        <>
            <DataTable
                value={rows}
                selectionMode="multiple"
                selectionPageOnly={true}
                selection={selectedRows!}
                onSelectionChange={(e) => setSelectedRows(e.value)}
                dataKey="id"
                scrollable
                scrollHeight="flex"
                tableStyle={{ minWidth: '50rem' }}
                emptyMessage={loading ? <Skeleton /> : 'No data found'}>
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} body={<Skeleton />}></Column>
                <Column field="title" header={titleHeader} body={loading ? <Skeleton width="10rem" /> : undefined}></Column>
                <Column field="place_of_origin" header="Place Of Origin" body={loading ? <Skeleton /> : undefined}></Column>
                <Column field="artist_display" header="Artist Display" body={loading ? <Skeleton /> : undefined}></Column>
                <Column field="inscriptions" header="Inscriptions" body={loading ? <Skeleton /> : undefined}></Column>
                <Column field="date_start" header="Date Start" body={loading ? <Skeleton /> : undefined}></Column>
                <Column field="date_end" header="Date End" body={loading ? <Skeleton /> : undefined}></Column>
            </DataTable>
            <Pagination totalRecords={totalRecords} page={page} setPage={setPage} />
        </>
    )
}

export default Table
