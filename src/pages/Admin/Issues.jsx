import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Issues(){
  const [issues, setIssues] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const { user } = useAuth()

  const loadIssues = async () => {
    try {
      const filters = {}
      if (filterStatus) filters.status = filterStatus.toLowerCase()
      if (filterPriority) filters.priority = filterPriority
      
      console.log('Loading issues with filters:', filters);
      
      const issuesData = await api.getIssues(filters)
      
      // Debug: Log all issue IDs and their properties
      console.log('=== ALL ISSUES DEBUG ===');
      issuesData.forEach((issue, index) => {
        console.log(`Issue ${index}:`, {
          _id: issue._id,
          id: issue.id,
          status: issue.status,
          subject: issue.subject,
          'has _id?': !!issue._id,
          'has id?': !!issue.id,
          '_id length': issue._id?.length,
          'id length': issue.id?.length
        });
      });
      
      setIssues(issuesData)
    } catch (error) {
      console.error('Error loading issues:', error)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [filterStatus, filterPriority])

  const updateIssueStatus = async (issueId, status, resolution = '', issue = null) => {
    try {
      const updateData = {
        status
      };
      
      // Only include resolvedBy and resolution for resolved/rejected status
      if (status === 'resolved' || status === 'rejected') {
        if (resolution) {
          updateData.resolution = resolution;
        }
        // Use the issue's lecturer ID as resolvedBy
        if (issue && issue.lecturer && issue.lecturer._id) {
          updateData.resolvedBy = issue.lecturer._id;
        }
      }
      
      console.log('=== UPDATE ISSUE DEBUG ===');
      console.log('Issue ID:', issueId);
      console.log('Status:', status);
      console.log('Update data:', updateData);
      
      await api.updateIssueStatus(issueId, updateData)
      await loadIssues()
      alert(`Issue marked as ${status}`)
    } catch (error) {
      console.error('Error in updateIssueStatus:', error);
      alert('Error updating issue: ' + error.message)
    }
  }

  const sendMessageToLecturer = async (issue) => {
    const msg = prompt(`Message to lecturer ${issue.lecturer.name} regarding ${issue.student.firstName}'s issue about ${issue.lecturer.course}:`)
    if (!msg) return
    
    try {
      await api.sendMessageToLecturer({
        lecturerId: issue.lecturer._id,
        issueId: issue._id, // Only use _id
        message: msg,
        adminId: user.id
      })
      alert('Message sent to lecturer')
    } catch (error) {
      alert('Error sending message: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase(); // Add this line
    switch (normalizedStatus) { // Use normalizedStatus
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_review': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      in_review: 0,
      resolved: 0,
      rejected: 0,
      total: issues.length
    }
    
    console.log('=== DEBUGGING STATUS COUNTS ===');
    console.log('Total issues:', issues.length);
    
    issues.forEach((issue, index) => {
      console.log(`Issue ${index}:`, {
        id: issue._id || issue.id,
        status: issue.status,
        subject: issue.subject
      });
      
      // Normalize status to lowercase
      const normalizedStatus = issue.status.toLowerCase();
      
      if (counts[normalizedStatus] !== undefined) {
        counts[normalizedStatus]++;
      } else {
        console.warn(`Unknown status: ${issue.status} for issue ${issue._id || issue.id}`);
      }
    });
    
    console.log('Final counts:', counts);
    console.log('=== END DEBUGGING ===');
    
    return counts;
  }

  const statusCounts = getStatusCounts()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl mb-4">Student Issues Management</h2>
        
        {/* Status Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-800">{statusCounts.total}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.in_review}</div>
            <div className="text-sm text-gray-600">In Review</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Status</label>
              <select 
                className="border p-2 rounded"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Priority</label>
              <select 
                className="border p-2 rounded"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setFilterStatus('')
                  setFilterPriority('')
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No issues found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="font-semibold text-lg mb-1">{issue.subject}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Type: {issue.issueType?.replace('_', ' ') || 'N/A'}
                  </div>
                  
                  <div className="mb-3">{issue.description}</div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Student:</strong> {issue.student?.firstName || 'Unknown'} {issue.student?.lastName || ''} ({issue.student?.email || 'No email'})
                    </div>
                    <div>
                      <strong>Lecturer:</strong> {issue.lecturer?.name || 'Unknown'} - {issue.lecturer?.course || 'No course'}
                    </div>
                  </div>

                  {issue.resolution && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <strong>Resolution:</strong> {issue.resolution}
                      {issue.resolvedBy && (
                        <div className="text-sm text-gray-600 mt-1">
                          Resolved by: {issue.resolvedBy.name} on {new Date(issue.resolvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => sendMessageToLecturer(issue)}
                  >
                    Contact Lecturer
                  </button>
                  
                  {issue.status.toLowerCase() === 'pending' && (
                    <>
                      <button 
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          const resolution = prompt('Enter resolution notes:')
                          if (resolution) {
                            updateIssueStatus(issue._id, 'resolved', resolution, issue) // Pass issue object
                          }
                        }}
                      >
                        Mark Resolved
                      </button>
                      <button 
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:')
                          if (reason) {
                            updateIssueStatus(issue._id, 'rejected', reason, issue) // Pass issue object
                          }
                        }}
                      >
                        Reject
                      </button>
                      <button 
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          updateIssueStatus(issue._id, 'in_review', '', issue) // Pass issue object
                        }}
                      >
                        Mark In Review
                      </button>
                    </>
                  )}
                  
                  {issue.status.toLowerCase() === 'in_review' && (
                    <>
                      <button 
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          const resolution = prompt('Enter resolution notes:')
                          if (resolution) {
                            updateIssueStatus(issue._id, 'resolved', resolution, issue) // Pass issue object
                          }
                        }}
                      >
                        Mark Resolved
                      </button>
                      <button 
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:')
                          if (reason) {
                            updateIssueStatus(issue._id, 'rejected', reason, issue) // Pass issue object
                          }
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}